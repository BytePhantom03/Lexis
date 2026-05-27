import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function dateFormmater(timestamp) {
	return dayjs(timestamp).fromNow();
}

export { dateFormmater };
