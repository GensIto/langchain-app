import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

export async function setupLogger() {
	await configure({
		reset: true,
		sinks: {
			console: getConsoleSink(),
		},
		loggers: [
			{
				category: ["app"],
				lowestLevel: "debug",
				sinks: ["console"],
			},
		],
	});
}

export { getLogger };
