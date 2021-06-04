module.exports = {
    appName: "AnyNews",
    basePath: "https://www.nasa.gov",
    enableCategories: true,
    flavors: {
        default: {
            name: "NASA",
            localeName: "en",
            defaultForLanguages: ["en"],
            cssFile: "./assets/css/default.css",
            services: [
                {
                    title: "Main service", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", categories: [
                        { url: "https://www.nasa.gov/rss/dyn/onthestation_rss.rss" },
                        { url: "https://www.nasa.gov/rss/dyn/chandra_images.rss" }
                    ]
                }
            ],
            isRTL: false
        },
        styled: {
            name: "Styled",
            localeName: "en",
            defaultForLanguages: ["sv"],
            cssFile: "./assets/css/styled.css",
            fonts: {
                "ZCOOL KuaiLe": {
                    normal: "ZCOOLKuaiLe-Regular.ttf"
                }
            },
            services: [
                {
                    title: "Main service", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", categories: [
                        { url: "https://www.nasa.gov/rss/dyn/onthestation_rss.rss" },
                        { url: "https://www.nasa.gov/rss/dyn/chandra_images.rss" }
                    ]
                }
            ],
            isRTL: false
        }
    }
};
