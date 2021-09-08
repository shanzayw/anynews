Please see [README.md](https://gitlab.com/guardianproject/anynews/-/blob/main/README.md) to set the basic configuration parameters, prior to adding Analytics to your instance of AnyNews.

# Disabling Analytics

You have to walk before you can run, so it's best to disable analytics when you've 
first installed AnyNews.  In fact, the initial AnyNews configuration in 
[config.js](https://gitlab.com/guardianproject/anynews/-/blob/main/src/config.js) has
analytics disabled:

```
module.exports = {
    appName: "MyNews",
    basePath: "https://www.mydomain.com/",
    enableCategories: false,
    //
    // *-- analytics disabled
    //
   	analytics: {
		enabled: false,
		type: "empty",
		config: {}
    },

    accentColor: "#6699cc",
    flavors: {
        default: {
            name: "MyFeed",
            localeName: "en",
            defaultForLanguages: ["en"],
            cssFile: "./assets/css/default.css",
            services: [
                {
                    title: "My Service", url: "/rss/news.rss"
                }
            ],
            isRTL: false
        },
	}
};

```

# Debugging

If you're debugging your instance of AnyNews, you might find the ConsoleLogger useful.  The ConsoleLogger writes messages normally sent to analytics engines to the `console` device in the browser. To enable the ConsoleLogger, use the following lines in the config.js file:

```
    //
    // *-- console logging instead of analytics
    //
   	analytics: {
		enabled: true,
		type: "console",
		config: {}
    },
```

# Using Analytics

Application usage measurement (analytics) is implemented in AnyNews via integration with the [Matomo](https://matomo.org) privacy-preserving analytics system using a special toolset provided by [Clean Insights](https://cleaninsights.org). Via simple configuration settings, it's possible to demonstrate the capabilities of Clean Insights and Matomo right from your instance of AnyNews.  If your organization already has a running instance of Matomo, it's easy to configure AnyNews for that instance.

If your organization uses another analytics system, you can add a new logging class to the AnyNews JavaScript code, customized to your needs.  Contact [Guardian Project](mailto:info@guardianproject.info) for assistance with analytics customization.

## Ethical Analytics with Clean Insights & Matomo

AnyNews promotes ethical analytics through support for [Clean Insights](https://cleaninsights.org). Clean Insights, in turn, works with [Matomo](https://matomo.org), a privacy-preserving analytics platform available for on-premises hosting or in the cloud.  

### Demonstration Instance of Matomo 
 The Clean Insights team runs a demonstration instance of Matomo to which your AnyNews instance can connect to test the Clean Insights approach to analytics.  To do so, send an email to `support@guardianproject.info`, and you'll receive the configuration data required. Then you'll modify the file [config.js](https://gitlab.com/guardianproject/anynews/-/blob/main/src/config.js). In the `analytics` object, set `enabled` to `true`, set `type` to `cleaninsights`, then insert all the information you where provided. Your configuration file will now resemble this:
  
```
module.exports = {
    appName: "MyNews",
    basePath: "https://www.mydomain.com/",
    enableCategories: false,
    
   	analytics: {
		enabled: true,
        //
        // *-- CleanInsights-specific configuration
        //
        type: "cleaninsights",
        config: {
        	//
        	// *-- Provided Clean Insights configuration information
        	// *-- Contact support@guardianproject.info
        	//
        	server: "https://metrics.cleaninsights.org/cleaninsights.php",
            siteid: 140103,
            timeout: 5,
            persistEveryNTimes: 1,
            debug: true,
            campaigns: {
                beta: {
                    start: "2021-01-01T00:00:00-00:00",
                    end: "2021-12-31T23:59:59-00:00",
                    aggregationPeriodLength: 1,
                    numberOfPeriods: 90,
                    onlyRecordOnce: false,
                    eventAggregationRule: "avg"
                }
            }
        }
    },

    accentColor: "#6699cc",
    flavors: {
        default: {
            name: "MyFeed",
            localeName: "en",
            defaultForLanguages: ["en"],
            cssFile: "./assets/css/default.css",
            services: [
                {
                    title: "My Service", url: "/rss/news.rss"
                }
            ],
            isRTL: false
        },
	}
};

```

### Private Instance of Matomo

If you are running your own instance of Matomo, follow the directions in your email as
to how to obtain and configure the [Clean Insights Matomo Proxy](https://gitlab.com/cleaninsights/clean-insights-matomo-proxy) for your server instance.  Then, you'll provide your own configuration information, in the form above, for example:

```
        config: {
        	server: "https://MYHOST.MYDOMAIN.com/cleaninsights.php",
            siteid: YOUR_DEFINED_SITE_ID,
            timeout: 5,
            persistEveryNTimes: 1,
            debug: true,
            campaigns: {
                beta: {
                    start: "START DATE",
                    end: "END DATE",
                    aggregationPeriodLength: 1,
                    numberOfPeriods: 90,
                    onlyRecordOnce: false,
                    eventAggregationRule: "avg"
                }
            }
        }
 
```

Many other variables can be set in the Clean Insights Matomo Proxy, depending on the
settings in your instance of Matomo. Sensible defaults are provided.  For additional 
information see the [design documents](https://gitlab.com/cleaninsights/clean-insights-design/-/blob/master/schema-docs/configuration.md).


