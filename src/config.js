module.exports = {
    appName: "France24News",
    basePath: "https://www.france24.com",
    enableCategories: false,
    accentColor: "#6699cc",
    analytics: {
        type: "console",
        enabled: false,
        config: {
        }
    },
    flavors: {
        France24: {
            name: "France24News",
            translationKey: "en",
            defaultForLanguages: ["en"],
            cssFile: "./assets/css/default.css",
            url: "https://www.france24.com/en/rss",
            defaultImage: "https://static.france24.com/meta_og_twcards/jsonld_publisher.png",
            categories: [
                { url: "https://www.france24.com/en/rss" },
                { url: "https://www.france24.com/en/europe/rss" }
            ],
            isRTL: false
        }
    }
}
