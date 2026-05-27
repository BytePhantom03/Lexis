const TimeFormate = (dateString) => {
	const now = new Date();
	const past = new Date(dateString);

	const seconds = Math.floor((now - past) / 1000);

	const units = [
		{ name: "year", value: 365 * 24 * 60 * 60 },
		{ name: "week", value: 7 * 24 * 60 * 60 },
		{ name: "day", value: 24 * 60 * 60 },
		{ name: "hour", value: 60 * 60 },
		{ name: "minute", value: 60 },
		{ name: "second", value: 1 },
	];

	// Special cases (better UX)
	if (seconds < 5) return "just now";
	if (seconds < 60) return `${seconds}s ago`;

	for (let unit of units) {
		const interval = Math.floor(seconds / unit.value);

		if (interval >= 1) {
			if (unit.name === "day" && interval === 1) {
				return "yesterday";
			}

			const label = interval === 1 ? unit.name : unit.name + "s";
			return `${interval} ${label} ago`;
		}
	}

	
	return `on ${past.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	})}`;
};

export { TimeFormate };
