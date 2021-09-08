Please see [README.md](https://gitlab.com/guardianproject/anynews/-/blob/main/README.md)  to set the basic configuration parameters, prior to customizing your instance of AnyNews. 

# AnyNews Customization

Although the AnyNews Progressive Web App (PWA) functions properly with the basic  configuration data you provided initially, you may wish to make additional customizations.   Most require simple configuration changes, not Javascript coding. 

## Level Zero

You'll almost certainly want your own icons for users who save your PWA to their home screen.  These files are in SVG format, are placed in the `src/assets/icons` directory and should be named `logo.svg` and `logoinverted.svg` (the latter supporting Dark Mode). If you do not have SVG-format files, remove the default versions of these two files and replace them with a single file in either JPG or PNG format, with the name `logo.jpg` or `logo.png` appropriately. After replacing the supplied icons with your own files, the npm installation script will generate all the necessary icon file sizes required for iOS, Android and desktop. Run 

```
npm run serve
```

Clear your device of any existing instance of your progressive web app.  Then point your browser to [localhost:8080/#/flavor/default](localhost:8080/#/flavor/default) and, once loaded, use "install to home screen".  Your application icons will show instead of the default AnyNews icons.  

## Level One

### Assure a Default Image (for Each Feed Item)

AnyNews prefers that each content item in your feed includes a link to an image to display in all feed listings and as the header image for the full content display. AnyNews looks, first, for an `<enclosure>` element in each feed `<item>`. Failing to find one, it will look for the first `<img>` HTML tag in the item's content.  Failing to find that, it will check the feed's `<channel>` elements for the `<image>` element.  Even this may not always succeed. 

To provide a default image to use when no other sources are available, edit the [config.js](https://gitlab.com/guardianproject/anynews/-/blob/main/src/config.js) file,  adding the full path to your default image as the value of the `flavors.default.defaultImage` element:

```
module.exports = {
    flavors: {
        default: {
    		//
			// --* use a fully-qualified URL here
    		//
    		defaultImage: "https://mydomain.com/images/default.png",
		}
	}
};

```

### Enable Categories

Categories let the PWA show multiple RSS feeds from the same site.  For example, you  might offer "latest news" as your main feed, with separate feeds for "sports" and "entertainment". Categories show up on the Categories page of the PWA (which only appears when Categories are enabled and present).  Each category gets its own item list on the Categories page.

Category feeds are just RSS feeds.  You decide what's in them, and you define the category  name using the `channel` `title` element in your RSS.  Note that because categories are selected from a scrolling horizontally-displayed list, it is best to keep category names short (for example, "Sports" instead of "The Brunswick News World Renowned Sports Page").  

Categories are enabled with two changes in [config.js](https://gitlab.com/guardianproject/anynews/-/blob/main/src/config.js). First, assure the `enableCategories` element of the `module.exports` object is set to `true`.  Next add your category feed addresses as an array of `url` elements in a new `flavors.default.services` element.  These should be full URL paths, and your category
content must be served from the same domain as your core content.

Here's a new config.js illustrating just the category additions:

```
module.exports = {
	//
	// --* set to true if providing additional feeds as categories
    //
    enableCategories: true,
    ...
    flavors: {
        default: {
            categories: [
                //
            	// --* add your category or categories here
            	//
            	{ url: "/rss/entertainment.xml" },
                { url: "/rss/sports.xml" }            
            ],
        },
	}
};

```

If you are using multiple flavors, it is not necessary that each flavor has the same categories, or has categories at all.  See the [FLAVORS.md](https://gitlab.com/guardianproject/anynews/-/blob/main/FLAVORS.md) document for intermixing categories and flavors.

Now run

```
npm run serve
```

Clear your device of any existing instance of your progressive web app.  Then point your browser to [localhost:8080/#/flavor/default](localhost:8080/#/flavor/default) and, once loaded, use "install to home screen". Select the Categories page that now appears to see your category feed(s).

### Enable Proxying

Some will prefer to offer their RSS feeds via a CDN-based proxy to improve performance,  circumvent censorship or distribute load.  While implementing a fully-proxied approach is beyond our descriptive ability here, if you already have a feed proxy set up,  it can be engaged in the following manner.

You'll be editing the [proxies.js](https://gitlab.com/guardianproject/anynews/-/blob/main/public/proxies.js) file to engage proxying.  At the top of this file, you'll find the class `ProxyHandlerClass` and in its constructor method the field `this.proxies` - a simple array of URLs.  You can supply as many as you are offering.  Upon startup, the PWA will sense that proxying is on and select  one at random to use.

You'll also see the field `proxiedUrls`.  This is the URL providing the proxied content. Modify this  to your site's base URL.

Here's a simplified version of what [proxies.js](https://gitlab.com/guardianproject/anynews/-/blob/main/public/proxies.js)  should look like:

```
(function () {
    class ProxyHandlerClass {
        constructor() {
            this.proxies =  [
            	//
            	// *-- remove (comment out) for production
            	//
                //"/localproxy",
                // 
                // *-- if proxying, your proxy/proxies here
                //
                "https://mysite.bigcdnsite.com/primary",
                "https://mysite.bigcdnsite.com/secondary"
            ];
            //
            // *-- the URLs you are proxying here
            //
            this.proxiedUrls = [
                "https://www.mysite.org"
            ];
        }
    }
    this.ProxyHandler = new ProxyHandlerClass();
}());
```

There's no local testing for this configuration, so you'll need to deploy a new instance of AnyNews to test your proxies.  Run

```
npm run build
```

and deploy your new instance to your core domain.  Point your browser to that location, load the new PWA and 'install to home screen'.  Use your CDN provider's console to verify that the PWA is acquiring the feed from the CDN proxy instead of the master CMS.

### Style Modifications (CSS)

If you feel good about your CSS skills, you can directly edit the style files in the  `src/assets/css`.  A gentle reminder that playing around with the CSS files that define  the look and layout of AnyNews will require prior CSS experience.   Entries in the CSS files often "cascade" to impact other entries.  Caution advised.

Remember to return your `public/proxies.js` file to local proxying while you test. Once ready for testing, run
 
```
npm run serve
```

Clear your device of any existing instance of your progressive web app.  Then point your browser to localhost:8080 and, once loaded, use "install to home screen".  Your CSS changes will be immediately visible. 
