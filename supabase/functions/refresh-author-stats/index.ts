import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type, accept",
};

Deno.serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		// Initialize Supabase client with Service Role Key for admin privileges
		// We use service_role because this job aggregates across ALL users
		const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
		const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

		if (!supabaseUrl || !supabaseServiceKey) {
			throw new Error("Missing Supabase environment variables");
		}

		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// 1. Fetch all published articles
		const { data: articles, error: fetchError } = await supabase
			.from("ArticleTable")
			.select("author_id, likes, comment_count, created_at, category")
			.not("created_at", "is", null);

		if (fetchError) {
			throw fetchError;
		}

		if (!articles || articles.length === 0) {
			return new Response(JSON.stringify({ message: "No articles found" }), {
				headers: { ...corsHeaders, "Content-Type": "application/json" },
				status: 200,
			});
		}

		// 2. Group articles by author_id
		const authorGroups = {};

		articles.forEach((article) => {
			if (!article.author_id) return;
			if (!authorGroups[article.author_id]) {
				authorGroups[article.author_id] = {
					articles: [],
					totalLikes: 0,
					totalComments: 0,
					categoryCounts: {},
				};
			}
			
			const group = authorGroups[article.author_id];
			group.articles.push(article);
			group.totalLikes += article.likes || 0;
			group.totalComments += article.comment_count || 0;
			
			if (article.category) {
				group.categoryCounts[article.category] = (group.categoryCounts[article.category] || 0) + 1;
			}
		});

		// 3. Compute stats for each author
		const statsToUpsert = [];

		for (const [author_id, group] of Object.entries(authorGroups)) {
			const totalArticles = group.articles.length;
			const avgLikes = group.totalLikes / totalArticles;
			const avgComments = group.totalComments / totalArticles;

			// Find top category
			let topCategory = null;
			let maxCategoryCount = 0;
			for (const [cat, count] of Object.entries(group.categoryCounts)) {
				if (count > maxCategoryCount) {
					maxCategoryCount = count;
					topCategory = cat;
				}
			}

			// Find best publish hour (most frequent hour among above-average engagement articles)
			// Defining engagement simply here for the hour calculation:
			const articleEngagements = group.articles.map(a => ({
				...a,
				engagement: (a.likes || 0) * 3 + (a.comment_count || 0) * 5,
				hour: new Date(a.created_at).getHours()
			}));

			const avgEngagement = articleEngagements.reduce((sum, a) => sum + a.engagement, 0) / totalArticles;
			
			// Filter to above average
			const aboveAvgArticles = articleEngagements.filter(a => a.engagement >= avgEngagement);
			
			// Count hours
			const hourCounts = {};
			const articlesToConsider = aboveAvgArticles.length > 0 ? aboveAvgArticles : articleEngagements;
			
			articlesToConsider.forEach(a => {
				hourCounts[a.hour] = (hourCounts[a.hour] || 0) + 1;
			});

			let bestHour = 9; // default
			let maxHourCount = 0;
			for (const [hr, count] of Object.entries(hourCounts)) {
				if (count > maxHourCount) {
					maxHourCount = count;
					bestHour = parseInt(hr, 10);
				}
			}

			// Note: We leave follower_count to be handled separately or default to 0 if not fetched here, 
			// because fetching followers requires another table join. Let's fetch follower count for each user.
			
			const { count: followerCount } = await supabase
				.from("FollowTable")
				.select("*", { count: 'exact', head: true })
				.eq("following_id", author_id);

			statsToUpsert.push({
				user_id: author_id,
				follower_count: followerCount || 0,
				avg_likes_per_article: parseFloat(avgLikes.toFixed(2)),
				avg_comments_per_article: parseFloat(avgComments.toFixed(2)),
				total_articles_published: totalArticles,
				best_publish_hour: bestHour,
				top_category: topCategory,
				updated_at: new Date().toISOString(),
			});
		}

		// 4. Upsert into author_stats table
		if (statsToUpsert.length > 0) {
			const { error: upsertError } = await supabase
				.from("author_stats")
				.upsert(statsToUpsert, { onConflict: 'user_id' });

			if (upsertError) {
				throw upsertError;
			}
		}

		return new Response(
			JSON.stringify({ 
				message: "Successfully refreshed author stats",
				authorsProcessed: statsToUpsert.length 
			}),
			{
				headers: { ...corsHeaders, "Content-Type": "application/json" },
				status: 200,
			}
		);
	} catch (error) {
		console.error("Error refreshing stats:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
			status: 500,
		});
	}
});
