module.exports = {
    appName: "AnyNews",
    basePath: "https://www.nasa.gov",
    enableCategories: true,
    accentColor: "#6699cc",
    flavors: {
        default: {
            name: "NASA",
            translationKey: "en",
            defaultForLanguages: ["en"],
            cssFile: "./assets/css/default.css",
            services: [
                {
                    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", 
                    //defaultImage: "<URL or base64 Data-URL>",
                    categories: [
                        { url: "https://www.nasa.gov/rss/dyn/onthestation_rss.rss" },
                        { url: "https://www.nasa.gov/rss/dyn/chandra_images.rss" }
                    ]
                }
            ],
            isRTL: false
        },
        styled: {
            name: "Styled",
            translationKey: "en",
            defaultForLanguages: ["sv"],
            cssFile: "./assets/css/styled.css",
            fonts: {
                "ZCOOL KuaiLe": {
                    normal: "ZCOOLKuaiLe-Regular.ttf"
                }
            },
            services: [
                {
                    url: "/rss/dyn/breaking_news.rss",
                    categories: [
                        { url: "https://www.nasa.gov/rss/dyn/onthestation_rss.rss" },
                        { url: "https://www.nasa.gov/rss/dyn/chandra_images.rss" }
                    ]
                }
            ],
            isRTL: false
        }
    }
};
