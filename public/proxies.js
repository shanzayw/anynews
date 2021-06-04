// eslint-disable-next-line
(function () {
    class ProxyHandlerClass {
        constructor() {
            this.proxies =  [
                "/localproxy"
                // "https://your.proxy.here"
                // "https://your.proxy2.here"
                // ..
            ];
            this.proxiedUrls = [
                "https://www.nasa.gov"
            ];
            this.idxCurrentProxy = 0;
            this.useDevServer = false;
            this.useStaticProxy = false; // Set to true to replace all URLs in incoming data
            this.setRandomProxy(); // Init to random
        }

        getCurrentProxy = function () {
            if (this.useDevServer == true) {
                // For development, use the development proxy set up in vue.config.js
                return '/localproxy';
            }
            return this.proxies[this.idxCurrentProxy];
        }

        setCurrentProxy = function (proxy) {
            if (proxy) {
                this.idxCurrentProxy = this.proxies.indexOf(proxy);
                if (this.idxCurrentProxy >= 0) {
                    return; // success
                }
            }

            // Not set or invlid, use a random one!
            this.setRandomProxy();
        }

        setRandomProxy() {
            this.idxCurrentProxy = Math.floor(Math.random() * Math.floor(this.proxies.length));
            console.log("RANDOM PROXY ----> " + this.getCurrentProxy());
        }

        moveToNextProxy = function () {
            this.idxCurrentProxy = (this.idxCurrentProxy + 1) % this.proxies.length;
            console.log("NEXT PROXY ----> " + this.getCurrentProxy());
            return this.getCurrentProxy();
        }

        shouldProxyUrl(url) {
            if (url) {
                for (const proxiedUrl of this.proxiedUrls) {
                    if (url.startsWith(proxiedUrl)) {
                        return true;
                    }
                }
            }
            return false;
        }

        getProxiedUrl(url) {
            if (url) {
                for (const proxiedUrl of this.proxiedUrls) {
                    if (url.startsWith(proxiedUrl)) {
                        const proxy = this.getCurrentProxy();
                        var path = url.split("://")[1];
                        path = path.substring(0, path.indexOf("/"));
                        const urlRewritten = url.replace(proxiedUrl, proxy + '/' + path);
                        console.log("getProxiedUrl rewrite: " + url + " -> " + urlRewritten);
                        return urlRewritten;
                    }
                }
            }
            return url;
        }

        /**
         * Replace all proxied URLs with the current proxy. This is used in cases where a service worked is
         * not available.
         * @param {*} data String with content, containing URLs and other stuff. 
         * @returns Same content but with all URLs that should be proxied replaced with current proxy.
         */
        staticReplace(data) {
            var result = data;
            // From: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
            var escapeRegExp = function(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            };
            for (const proxiedUrl of this.proxiedUrls) {
                var proxiedUrlRegexp = escapeRegExp(proxiedUrl);
                var regexp = new RegExp(proxiedUrlRegexp, 'gi');
                result = result.replace(regexp, (match, ignoredp1, ignoredp2, ignoredp3, ignoredoffset, ignoredstring) => { return this.getCurrentProxy() + "/" + match.split("://")[1]});
            }
            return result;
        }
    }
    this.ProxyHandler = new ProxyHandlerClass();
}());
