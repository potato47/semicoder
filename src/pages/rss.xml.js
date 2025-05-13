import rss, { pagesGlobToRssItems } from "@astrojs/rss";

export async function GET(context) {
	return rss({
		title: "新手程序员",
		description: "新手程序员",
		site: context.site,
		items: await pagesGlobToRssItems(import.meta.glob("./**/*.md")),
		customData: '<language>zh-cn</language>',
	});
}
