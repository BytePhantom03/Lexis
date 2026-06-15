import React from "react";
import { Loader2 } from "lucide-react";

export default function EngagementSidebar({ score, features, isLoading, tips, onApplyTip, isApplyingTip }) {
	const safeScore = Math.round(score || 0);

	let label = "Low potential";
	let colorClass = "text-red-500";
	let bgClass = "bg-red-500";
	
	if (safeScore > 25 && safeScore <= 50) {
		label = "Moderate";
		colorClass = "text-yellow-500";
		bgClass = "bg-yellow-500";
	} else if (safeScore > 50 && safeScore <= 75) {
		label = "Good";
		colorClass = "text-blue-500";
		bgClass = "bg-blue-500";
	} else if (safeScore > 75) {
		label = "Strong";
		colorClass = "text-green-500";
		bgClass = "bg-green-500";
	}

	// Circumference for SVG circle
	const radius = 60;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (safeScore / 100) * circumference;

	return (
		<div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-6 border border-gray-100 dark:border-white/5 overflow-y-auto">
			<h3 className="text-lg font-semibold mb-6 text-center">Predicted Engagement</h3>

			{/* Score Meter */}
			<div className="flex flex-col items-center justify-center mb-8 relative">
				<div className="relative flex items-center justify-center">
					{/* Background Circle */}
					<svg className="transform -rotate-90 w-40 h-40">
						<circle
							cx="80"
							cy="80"
							r={radius}
							stroke="currentColor"
							strokeWidth="12"
							fill="transparent"
							className="text-gray-200 dark:text-gray-800"
						/>
						{/* Progress Circle */}
						<circle
							cx="80"
							cy="80"
							r={radius}
							stroke="currentColor"
							strokeWidth="12"
							fill="transparent"
							strokeDasharray={circumference}
							strokeDashoffset={strokeDashoffset}
							className={`transition-all duration-1000 ease-out ${colorClass}`}
							strokeLinecap="round"
						/>
					</svg>
					<div className="absolute flex flex-col items-center justify-center">
						{isLoading ? (
							<Loader2 className="animate-spin text-gray-400" size={32} />
						) : (
							<span className={`text-4xl font-bold ${colorClass}`}>{safeScore}</span>
						)}
					</div>
				</div>
				<div className="mt-4 text-center">
					<span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${colorClass} border-current opacity-90`}>
						{label}
					</span>
				</div>
			</div>

			{/* Tips Section */}
			<div className="flex-1">
				<h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
					Actionable Tips
				</h4>
				{tips && tips.length > 0 ? (
					<ul className="space-y-3">
						{tips.map((tip, idx) => (
							<li key={idx} className="group relative text-sm p-3 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 shadow-sm leading-relaxed overflow-hidden">
								{tip}
								{onApplyTip && (
									<div className="absolute inset-0 bg-white/90 dark:bg-[#1a1a1a]/95 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
										<button
											type="button"
											disabled={isApplyingTip !== null}
											onClick={() => onApplyTip(tip)}
											className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isApplyingTip === tip ? (
												<>
													<Loader2 className="animate-spin" size={14} />
													Applying...
												</>
											) : (
												<>✨ Apply Tip</>
											)}
										</button>
									</div>
								)}
							</li>
						))}
					</ul>
				) : (
					<div className="text-sm text-gray-400 text-center py-4 italic">
						Keep writing to generate tips.
					</div>
				)}
			</div>
		</div>
	);
}
