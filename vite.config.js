import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			// Recommended minimal setup – customize as needed
			registerType: "autoUpdate", // auto updates when new version available

			// Recommended: better dev experience
			devOptions: {
				enabled: true, // show PWA features in dev (optional)
			},

			// Very important: include these assets in the service worker precache
			includeAssets: [
				"favicon.ico",
				"apple-touch-icon.png",
				"masked-icon.svg",
				"*.json",
				"pwa-*.png", // you'll add these later
			],
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,txt,xml}"],
			},

			// Web App Manifest – customize these!
			manifest: {
				name: "Lexis", // full name
				short_name: "Lexis", // home screen name (≤12 chars best)
				description: "Blogging Made Simple.💖",
				theme_color: "#0f172b",
				background_color: "#0f172b",
				display: "standalone", // or "minimal-ui", "browser", "fullscreen"
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable", // important for Android adaptive icons
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			// eslint-disable-next-line no-undef
			"@": path.resolve(__dirname, "./src"),
		},
	},
	base: "/",


});
