// Read version from package.json
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

const webpack = require('webpack');
const WebpackBeforeBuildPlugin = require('before-build-webpack');

const config = require('./src/config');

// Stamp service worker with current version string!
const fileNameIn = "service-worker-source.js";
const fileNameOut = "service-worker-versioned.js";
fs.readFile(fileNameIn, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var result = data.replace(/APP_VERSION_PLACEHOLDER/g, "'" + version + "'");

    fs.writeFile(fileNameOut, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});

module.exports = {
    devServer: {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
        proxy: {
            "^/localproxy": {
                changeOrigin: true,
                //followRedirects: true,
                target: "localhost",
                router: function (req) {
                    // Remove "/localproxy"
                    var path = req.originalUrl.substring(12);
                    // Host is the first segment
                    path = path.substring(0, path.indexOf("/"));
                    var host = path;
                    return {
                        protocol: 'https:',
                        host: host,
                    }
                },
                pathRewrite: function (path, req) {
                    // Remove the first segment, that is the host
                    var p = path.substring(12);
                    p = p.substring(p.indexOf("/"));
                    return p;
                },
                logLevel: 'debug',
                secure: false
            },
        }
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? './'
        : './',

    chainWebpack: config => {
        config.plugin('html').tap(args => {
            // Stamp the title into the HTML page
            const config = require('./src/config');
            args[0].title = config.appName;
            return args;
        })
    },

    pwa: {
        name: config.appName,
        themeColor: "#0E813D",
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        manifestOptions: {
            start_url: "./index.html",
            background_color: "#FFFFFF",
            display: "standalone",
            iconPaths: {
                favicon32: 'img/icons/favicon-32x32.png',
                favicon16: 'img/icons/favicon-16x16.png',
                appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
                maskIcon: 'img/icons/safari-pinned-tab.svg',
                msTileImage: 'img/icons/msapplication-icon-144x144.png'
            },
            "icons": [
                {
                    "src": "./img/icons/android-chrome-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/android-chrome-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/apple-touch-icon-60x60.png",
                    "sizes": "60x60",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/apple-touch-icon-76x76.png",
                    "sizes": "76x76",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/apple-touch-icon-120x120.png",
                    "sizes": "120x120",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/apple-touch-icon-152x152.png",
                    "sizes": "152x152",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/apple-touch-icon-180x180.png",
                    "sizes": "180x180",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/apple-touch-icon.png",
                    "sizes": "180x180",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/favicon-16x16.png",
                    "sizes": "16x16",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/favicon-32x32.png",
                    "sizes": "32x32",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/msapplication-icon-144x144.png",
                    "sizes": "144x144",
                    "type": "image/png"
                },
                {
                    "src": "./img/icons/mstile-150x150.png",
                    "sizes": "150x150",
                    "type": "image/png"
                }
            ],
        },
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: 'service-worker-versioned.js',
            swDest: 'service-worker.js',
            exclude: [
                'assets/fonts/', /\.map$/
            ]
        }
    },

    configureWebpack: {
        devtool: 'source-map',
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    PACKAGE_VERSION: '"' + version + '"'
                },
            }),
            new WebpackBeforeBuildPlugin(function (stats, callback) {
                // Do whatever you want...
                console.log("********* Processing icons **************");
                const iconTemplate = "<template>SVGDATA</template>\n<script>\nexport default { name: 'ICONNAME'};\n</script>\n<style scoped>\npath {fill: currentColor !important;}\n</style>\n";
                fs.readdirSync('./src/assets/icons').forEach(file => {
                    fs.readFile('./src/assets/icons/' + file, 'utf8', function (err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        var iconName = file.split('.')[0];

                        var result = iconTemplate.replace(/SVGDATA/g, data);
                        result = result.replace(/ICONNAME/g, iconName);

                        // Remove possible <?xml tag
                        result = result.replace(/<\?xml[^\?]*\?>/g, "");

                        // Add icon specific class name
                        result = result.replace(/<svg/g, "<svg class=\"icon-" + iconName + "\"");
                        const outFileName = "Icon" + iconName.substring(0, 1).toUpperCase() + iconName.substring(1) + ".vue";
                        fs.readFile('./src/icons/' + outFileName, 'utf8', function (err, oldData) {
                            if (!err && oldData == result) {
                                // No change
                                return;
                            }
                            fs.writeFile('./src/icons/' + outFileName, result, 'utf8', function (err) {
                                if (err) return console.log(err);
                            });
                        });
                    });
                });
                callback(); // don't call it if you do want to stop compilation
            }, ['beforeCompile']),
        ]
    },

    lintOnSave: 'warning',
}
