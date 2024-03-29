// eslint-disable-next-line
(function () {
    class ProxyHandlerClass {
        constructor() {
            this.proxies = [
                // For development, use the development proxy set up in vue.config.js
                "/localproxy"
                // "https://your.proxy.here"
                // "https://your.proxy2.here"
                // ..
            ];
            this.proxiedUrls = [
                "https://www.france24.com"
            ];
            this.idxCurrentProxy = 0;
            this.useStaticProxy = false; // Set to true to replace all URLs in incoming data
            this.setRandomProxy(); // Init to random
        }

        getCurrentProxy = function () {
            if (this.idxCurrentProxy >= this.proxies.length || this.idxCurrentProxy < 0) {
                return null;
            }
            return this.ensureTrailingSlash(this.proxies[this.idxCurrentProxy]);
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
        }

        moveToNextProxy = function () {
            if (this.proxies.length > 0) {
                this.idxCurrentProxy = (this.idxCurrentProxy + 1) % this.proxies.length;
                return this.getCurrentProxy();
            }
            return null;
        }

        ensureTrailingSlash(url) {
            if (url.endsWith("/")) {
                return url;
            }
            return url + "/";
        }

        shouldProxyUrl(url) {
            if (url) {
                for (var p of this.proxiedUrls) {
                    const proxiedUrl = this.ensureTrailingSlash(p);
                    if (url.startsWith(proxiedUrl)) {
                        return true;
                    }
                }
            }
            return false;
        }

        getProxiedUrl(url) {
            if (url) {
                for (var p of this.proxiedUrls) {
                    const proxiedUrl = this.ensureTrailingSlash(p);
                    if (url.startsWith(proxiedUrl)) {
                        const proxy = this.getCurrentProxy();
                        var path = url.split("://")[1];
                        path = path.substring(0, path.indexOf("/") + 1);
                        const urlRewritten = url.replace(proxiedUrl, proxy + path);
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
            var escapeRegExp = function (string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            };
            for (var p of this.proxiedUrls) {
                const proxiedUrl = this.ensureTrailingSlash(p);
                var proxiedUrlRegexp = escapeRegExp(proxiedUrl);
                var regexp = new RegExp(proxiedUrlRegexp, 'gi');
                result = result.replace(regexp, (match, ignoredp1, ignoredp2, ignoredp3, ignoredoffset, ignoredstring) => { return this.getCurrentProxy() + match.split("://")[1] });
            }
            return result;
        }
    }
    this.ProxyHandler = new ProxyHandlerClass();
}());
