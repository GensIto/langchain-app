import { readdirSync } from "node:fs";

import type { Config } from "drizzle-kit";

const fileNames = readdirSync(".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

const fileName = fileNames.find((fileName) => {
	return fileName.endsWith(".sqlite");
});

if (fileName === undefined) {
	throw new Error("No sqlite file found");
}

export default {
	dialect: "sqlite",
	schema: "./src/db/schema.ts",
	out: "drizzle",
	dbCredentials: {
		url: `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/${fileName}`,
	},
} satisfies Config;
