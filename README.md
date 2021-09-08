# AnyNews

If you're unfamiliar with Node.js and its package manager, npm, you can find the 
documentation for these [here](https://nodejs.org/en/download/) and 
[here](https://nodejs.org/en/download/package-manager/). 

Once your Node.js setup is complete, download this repository and then, from the installation directory...

## Project Setup/Installation Test

Run the following [npm commands](https://docs.npmjs.com/cli/v7/commands/npm) to install the packages you've downloaded and run AnyNews.

```
npm install
npm run serve
```

Once the npm web server starts up, point your browser to [localhost:8080/#/flavor/default](localhost:8080/#/flavor/default) to run the supplied demonstration configuration.

### Basic Configuration, Compile and Test

To direct AnyNews to your preferred content source, you'll modify two files:  
[src/config.js](https://gitlab.com/guardianproject/anynews/-/blob/main/src/config.js) 
and [public/proxies.js](https://gitlab.com/guardianproject/anynews/-/blob/main/public/proxies.js).  Make a backup of each before proceeding.

First, modify [src/config.js](https://gitlab.com/guardianproject/anynews/-/blob/main/src/config.js) 
to include (minimally) your service name and feed url.  In the `module.exports` object, change `appName` (short name for your PWA, used when installed to home screen), `basepath` (root URL of your site, without trailing slash), `flavors.default.name` (name for this feed, can be the same as `appName`), and `flavors.default.url` (the URL path to your content feed, relative to `basePath`).  If you prefer, you can set `basepath` to the empty string and set `flavors.default.url` to the fully-qualified feed URL.  

Lastly, change `enableCategories` to `false`, and set `flavors.default.categories` to an empty array.  If your news services does, in fact, support category feeds we'll add that later.  Feeling frisky? You can modify `accentColor` to change the base color from which most graphic elements are derived.

Your config.js will then resemble this:

```
module.exports = {
    appName: "MyNews",
    basePath: "https://mydomain.com",
    enableCategories: false,
    accentColor: "#6699cc",
    flavors: {
        default: {
            name: "MyFeed",
            localeName: "en",
            defaultForLanguages: ["en"],
            cssFile: "./assets/css/default.css",
            url: "https://mydomain.com/feed/",
            //defaultImage: "<URL or base64 Data-URL>",
            categories: [
            ],
            isRTL: false
        },
	}
};

```

We need to make one more change so that you can run tests on your brand new instance of AnyNews.  Modify the file [public/proxies.js](https://gitlab.com/guardianproject/anynews/-/blob/main/public/proxies.js) to indicate that access to your service URL will be proxied through the Node Package Manager development environment while you are testing.  In the class `ProxyHandlerClass`, 
you'll notice that `this.proxies` is set to use `"/localproxy"`.  Leave that in place.
Immediately below, change `this.proxiedUrls` from `https://www.nasa.gov` to the `basePath` URL you used in `config.js` (again, no trailing slash).  If you used an empty path as the `basePath` in `config.js`, supply the scheme and domain here. In our sample above we have `https://www.mydomain.com`.

As a result, the top portion of your [public/proxies.js](https://gitlab.com/guardianproject/anynews/-/blob/main/public/proxies.js) file will look like:

```
// eslint-disable-next-line
(function () {
    class ProxyHandlerClass {
        constructor() {
            this.proxies =  [
            	//
            	// *-- enable /localproxy for testing/development
            	//
                "/localproxy"
                //
                // *-- if you're proxying, insert your proxy URLs here (no trailing slash)
                //
                // "https://your.proxy.here"
                // "https://your.proxy2.here"
                // ..
            ];
            //
            // --* same URL as 'basepath' on src/config.js
            // Make sure there is no trailing slash on this URL
            //
            this.proxiedUrls = [
                "https://www.mydomain.com"
            ];
            this.idxCurrentProxy = 0;
            this.useDevServer = false;
            this.useStaticProxy = false; // Set to true to replace all URLs in incoming data
            this.setRandomProxy(); // Init to random
        }
...
```

Return to the AnyNews top-level directory once you've made these modifications and run 
the following command:

```
npm run serve
```

NOTE: If you DID NOT run the demonstration above, you'll need to initialize npm here, so
instead run:

```
npm install
npm run serve
```

Point your browser to [localhost:8080/#/flavor/default](localhost:8080/#/flavor/default) to run your new instance of AnyNews against the local proxy.

### Compile and Minify for Production

Once you're satisfied with your changes, you can build your progressive web app for deployment.

First, however, edit the [public/proxies.js](https://gitlab.com/guardianproject/anynews/-/blob/main/public/proxies.js) file to comment-out the `/localproxy` line, as well as proxied URL in `this.proxiedUrls`, like so

```
...
            this.proxies =  [
            	//
            	// *-- disable /localproxy for deployment
            	//
                //"/localproxy"
                //
                // *-- if you're proxying, insert your proxy URLs here (no trailing slash)
                //
                // "https://your.proxy.here"
                // "https://your.proxy2.here"
                // ..
            ];
            this.proxiedUrls = [
                //"https://www.nasa.gov"
            ];            

...
```
 
Now, run the following command

```
npm run build
```

### Deployment

The files in your (newly created) `dist` directory are now ready for deployment.  Your deployment should be served from the same domain as your content to avoid problems with CORS.  Copy the contents of that directory in their entirety to your deployment location.  

We're using the Vue toolkit for AnyNews and there might be some subtleties in configuring your deployment environment.  See the [instructions](https://cli.vuejs.org/guide/deployment.html) for Vue-oriented details of deploying your new app.

Please see [CUSTOMIZATION.md](https://gitlab.com/guardianproject/anynews/-/blob/main/CUSTOMIZATION.md) for additional ways to customize your version of AnyNews (site icon, graphics, multiple feeds, etc). Please see [FLAVORS.md](https://gitlab.com/guardianproject/anynews/-/blob/main/FLAVORS.md) to 
implement internationalization or to offer different content to unique audience segments.

