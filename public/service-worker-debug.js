/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("./dexie.js");
importScripts("./proxies.js");
importScripts('./workbox/workbox-v5.1.3/workbox-sw.js');

workbox.setConfig({
  debug: true,
  modulePathPrefix: './workbox/workbox-v5.1.3/'
});

// Load modules
workbox.loadModule('workbox-cacheable-response');
workbox.loadModule('workbox-strategies');
workbox.loadModule('workbox-expiration');
workbox.loadModule('workbox-routing');
workbox.loadModule('workbox-precaching');

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

const db = new Dexie("nuusdb");
db.version(1).stores({
  media: "url",
  items: "id"
});
db.version(2).stores(
  {
      feeds: "url"
  }
)
db.version(3).stores(
  {
      items: "id, feed"
  }
)
db.version(4).stores(
  {
      log_sw: "++id"
  }
)

function cloneRequest(urlOrReq, newUrl,options) {
  // make sure we deal with a Request object even if we got a URL string
  const req = urlOrReq instanceof Request ? urlOrReq : new Request(urlOrReq);
  
  var init = {};
  Object.keys(Request.prototype).forEach(function (value) {
      init[value] = req[value];
  });
  delete init.url;

  return new Request(newUrl, Object.assign(init, options || {}));
}

function getProxiedRequest(request) {
  var url = request.url.toString();
  if (ProxyHandler.shouldProxyUrl(url)) {
    return cloneRequest(request, ProxyHandler.getProxiedUrl(url));
  }
  return request;
}

const proxyCachePlugin = {
  cacheKeyWillBeUsed: async ({request, mode}) => {
    console.log("cacheKeyWillBeUsed", request.url);
    return request;
  },
  requestWillFetch: async ({request}) => {
    // Maybe send request through a proxy
    return getProxiedRequest(request);
  },
};

const strategyFeed = new workbox.strategies.StaleWhileRevalidate({
  cacheName: 'feed-cache',
  plugins: [
    new workbox.cacheableResponse.CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new workbox.expiration.ExpirationPlugin({
      maxAgeSeconds: 60 * 60 * 24 * 7, // A week
      maxEntries: 20
    }),
    proxyCachePlugin
  ]
});

console.log("Registering route!");
workbox.routing.registerRoute(
  /^https:\/\/.+\.xml/,
  strategyFeed
);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year...
workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

self.addEventListener('message', (event) => {
  console.log("SW - Got message:");
  console.log(event);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'FEED_URL_UPDATE') {
    console.log("Feed URL update:");
    const {updatedURLs} = event.data.payload;
    console.log(updatedURLs);
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage('0.1.45');
  }
});

self.addEventListener('fetch', (e) => {
  var request = getProxiedRequest(e.request);
  e.respondWith(
      fetch(request)
          .then((response) => {
              if (response.ok || response.status == 0) return response;
              //console.log("ERROR FETCHING: " + e.request.url, response);
              db.log_sw.add({type:"fetch_error", url:e.request.url});
              return response;
          })
          .catch(error => {
            //console.error('EXCEPTION FETCHING: ', error, e.request.url);
        })
  )
});


/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
