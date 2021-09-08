import sanitizeHTML from 'sanitize-html';
import db from '../database';
import FeedModel from '../models/feedmodel.js';
import ItemModel from '../models/itemmodel.js';
import { isNullOrUndefined } from "util";
import config from "../config";
const ProxyHandler = require('./proxy').default;

export default class RSSParser {

    static fetchCategoryUrl(url, defaultImage, callback) {
        // TODO - add cat requests to array, so we can cancel them if main feed changes?
        return RSSParser.fetchUrl(url, defaultImage, callback);
    }

    static fetchUrl(url, defaultImage, callback) {
        const self = this;
        if (!url) {
            callback(null, null);
            return;
        }

        if (url.startsWith("/")) {
            url = config.basePath + url;
        }

        if (url.endsWith("zip")) {
            window.axios.get(url, { responseType: "blob" })
                .then(function (response) {
                    var JSZip = require("jszip");
                    console.log("Loading ZIP file");
                    JSZip.loadAsync(response.data).then(function (zip) {
                        console.log("Loaded ZIP file");
                        var result = null;
                        var promises = [];

                        zip.forEach(function (relativePath, file) {
                            console.log("iterating over", relativePath);
                            if (relativePath == "index.rss") {
                                promises.push(file.async("string")
                                    .then(function (text) {
                                        result = self.parseFeed(self, text, url, defaultImage);
                                    }));
                            } else if (relativePath.startsWith("enc/") && !file.dir) {
                                let url = "file://" + relativePath;

                                // Cached already?
                                promises.push(
                                    db.getMediaFile(url).then(function (blob) {
                                        if (blob == null) {
                                            promises.push(file.async('nodebuffer').then(function (binaryData) {
                                                let blob = new Blob([binaryData], { type: 'audio/mpeg' });
                                                db.media.add({ url: "file://" + relativePath, blob: blob });
                                            }));
                                        }

                                    }));
                            }
                        });

                        // Wait until all promises are fulfilled
                        Promise.all(promises).then(function () {
                            callback(result.feed, result.items);
                        });
                    });
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .then(function () {
                    // always executed
                });
        } else {
            console.log("Ask axios to get: " + url);
            const options = {
                method: "get",
                url: url
                //headers: {common: {'x-destination': 'feed'}}
            };
            window.axios(options)
                .then(function (response) {
                    let result = self.parseFeed(self, response.data, url, defaultImage);
                    callback(result.feed, result.items);
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .then(function () {
                    // always executed
                });
        }
    }

    static parseFeed(self, data, url, defaultImage) {
        // Get the parseString function
        var parseString = require('xml2js').parseString;

        if (ProxyHandler.useStaticProxy) {
            // Replace all URLs that need to be proxied.
            data = ProxyHandler.staticReplace(data);
        }

        var parseResult = null;
        parseString(data, { explicitArray: false }, function (ignoredError, result) {
            //console.log(result);
            if (result["rdf:RDF"] != null) {
                parseResult = self.parseRDF(self, result, url, defaultImage);
            } else if (result.rss != null) {
                parseResult = self.parseRSS(self, result, url, defaultImage);
            }
        });
        console.log(parseResult);

        // Store feed in DB
        db.storeFeed(parseResult.feed);

        return parseResult;
    }

    static parseRSS(self, result, feedUrl, feedDefaultImage) {
        return self.parseData(self, result.rss.channel, result.rss.channel, feedUrl, feedDefaultImage);
    }

    static parseRDF(self, result, feedUrl, feedDefaultImage) {
        return self.parseData(self, result["rdf:RDF"].channel, result["rdf:RDF"], feedUrl, feedDefaultImage);
    }

    static getText = function (elt) {
        if (typeof (elt) === 'string') return elt;
        if (typeof (elt) === 'object' && Object.prototype.hasOwnProperty.call(elt, '_')) return elt._;
        return null;
    }

    static relativeToAbsolute(feedUrl, url) {
        if (feedUrl && url && url.startsWith("./")) {
            // from: https://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
            return new URL(url,feedUrl).href
        } else {
            return url;
        }
    }

    static parseData(self, channelElement, itemParentElement, feedUrl, feedDefaultImage) {
        var items = [];

        var feed = new FeedModel();
        feed.url = feedUrl;
        feed.title = channelElement.title;
        feed.link = channelElement.link;
        feed.description = channelElement.description;
        if (channelElement.image != null) {
            if (channelElement.image.$ != null && channelElement.image.$["rdf:resource"] != null) {
                feed.imageUrl = channelElement.image.$["rdf:resource"]
            } else {
                feed.imageUrl = channelElement.image.url;
            }
        }
        if (feed.imageUrl == null && channelElement["itunes:image"] != null) {
            feed.imageUrl = channelElement["itunes:image"].$.href;
        }

        // Categories
        var feedCategories = channelElement["itunes:category"];
        if (feedCategories != null) {
            if (Array.isArray(feedCategories) && feedCategories.length > 0) {
                feed.category = feedCategories[0].$.text;
            } else {
                feed.category = feedCategories.$.text;
            }
        }
        if (feed.category == null) {
            feedCategories = channelElement["category"];
            if (feedCategories != null) {
                if (Array.isArray(feedCategories) && feedCategories.length > 0) {
                    feed.category = self.getText(feedCategories[0]);
                } else {
                    feed.category = self.getText(feedCategories);
                }
            }
        }

        // Make array if not already
        if (!Array.isArray(itemParentElement.item)) {
            if (!itemParentElement.item) {
                itemParentElement.item = [];
            } else {
                itemParentElement.item = [itemParentElement.item];
            }
        }

        itemParentElement.item.forEach(i => {
            var item = new ItemModel();
            item.feed = feedUrl;
            item.title = i.title;
            item.link = self.getText(i.link);
            item.guid = self.getText(i.guid);
            if (item.guid == null || item.guid.length == 0) {
                item.guid = item.title;
            }
            //console.log(item.guid);
            item.description = sanitizeHTML(i.description);
            item.pubDate = i.pubDate;
            if (item.pubDate == null) {
                item.pubDate = self.getText(i["dc:date"]);
            }
            item.author = i.author;
            item.content = self.getText(i["content:encoded"]);
            var mediaContent = i["media:content"];

            const handleMediaContent = function (item, mediaContent) {
                const medium = mediaContent.$.medium;
                const type = mediaContent.$.type;
                const url = mediaContent.$.url;
                const thumb = mediaContent["media:thumbnail"];
                if (medium == "video") {
                    item.enclosure = url;
                    item.enclosureType = type;
                    if (!isNullOrUndefined(thumb)) {
                        item.imageSrc = thumb.$.url;
                    }
                } else if (medium == "audio") {
                    item.enclosure = url;
                    item.enclosureType = type;
                    if (!isNullOrUndefined(thumb)) {
                        item.imageSrc = thumb.$.url;
                    }
                } else {
                    item.imageSrc = mediaContent.$.url;
                }
            };

            if (Array.isArray(mediaContent) && mediaContent.length > 0) {
                for (var idxMC = 0; idxMC < mediaContent.length; idxMC++) {
                    handleMediaContent(item, mediaContent[idxMC]);
                }
            } else if (mediaContent != null) {
                handleMediaContent(item, mediaContent);
            }

            var enclosure = i["enclosure"];
            if (Array.isArray(enclosure) && enclosure.length > 0) {
                item.enclosure = enclosure[0].$.url;
                item.enclosureType = enclosure[0].$.type;
            } else if (enclosure != null) {
                item.enclosure = enclosure.$.url;
                item.enclosureType = enclosure.$.type;
            }

            // Try RDF enclosure
            if (item.enclosure == null || item.enclosure.length == 0) {
                enclosure = i["enc:enclosure"];
                if (Array.isArray(enclosure) && enclosure.length > 0) {
                    item.enclosure = enclosure[0].$["rdf:resource"];
                    item.enclosureType = enclosure[0].$.type;
                } else if (enclosure != null) {
                    item.enclosure = enclosure.$["rdf:resource"];
                    item.enclosureType = enclosure.$.type;
                }
            }

            // Try to figure out category from dc:subject.
            var categories = i["dc:subject"];
            if (categories == null) {
                categories = i["category"];
            }
            if (categories != null) {
                if (Array.isArray(categories) && categories.length > 0) {
                    item.category = self.getText(categories[0]);
                } else if (categories != null) {
                    item.category = self.getText(categories);
                }
            }

            // Keywords
            var tags = i["keywords"];
            if (tags != null) {
                if (Array.isArray(tags) && tags.length > 0) {
                    item.tags = self.getText(tags[0]);
                } else if (tags != null) {
                    item.tags = self.getText(tags);
                }
            }

            // Handle superfeed extensions
            if (i["superfeed:channelTitle"] != null) {
                item.channelTitle = i["superfeed:channelTitle"];

                // Use channel title as category
                item.category = item.channelTitle;
            }
            if (i["superfeed:channelDescription"] != null) {
                item.channelDescription = i["superfeed:channelDescription"];
            }
            if (i["itunes:image"] != null && !item.imageSrc) {
                item.imageSrc = i["itunes:image"].$.href;
                console.log("Set image to", item.imageSrc);
            }

            items.push(item);

            // Set image from enclosure?
            if (item.imageSrc == null && item.enclosure && item.enclosureType && item.enclosureType.startsWith("image/")) {
                item.imageSrc = item.enclosure;
            } else if (item.imageSrc == null && item.content != null) {
                //Try to find an image in the content
                var parseString = require('xml2js').parseString;
                parseString("<root>" + item.content + "</root>", {
                    explicitRoot: true,
                    explicitArray: true,
                    strict: true
                }, function (err, result) {
                    console.log("Parsed");
                    if (err == null && result != null) {
                        var image = (result.root.img == null) ? null : result.root.img[0];
                        if (image != null) {
                            item.imageSrc = image.$.src;

                            // Now that we use the first image as "header image", remove that one from the content!
                            console.log("Remove old image!!!" + item.imageSrc);
                            item.content = item.content.replace(/<img[^>]*>/i, "<span></span>");
                        }
                    }
                });
            }

            // Still no image? Use default feed one if set.
            if (!item.imageSrc) {
                item.imageSrc = feedDefaultImage;
            }

            if (item.content != null) {
                // Remove "width" and "height" from youtube embeds and wrap them in a
                // <div class="videoWrapper">
                item.content = item.content.replace(/(<iframe[^>]+)height=".*?"([^>]*>.*<\/iframe>)/i, "<div class='videoWrapper'>$1$2</div>");
                item.content = item.content.replace(/(<iframe[^>]+)width=".*?"/i, "$1");
            }

            // Transform all relative URL:s into absolute ones, since they are relative to RSS, not the PWA.
            //
            for (const key of Object.keys(item)) {
                const o = item[key];
                if (o && typeof(o) === "string" && o.startsWith("./")) {
                    const absolute = self.relativeToAbsolute(feedUrl, o);
                    console.log("Found relative: " + o + " for key name " + key + " -> " + absolute);
                    item[key] = absolute;
                }
            }
        });

        // Should not be needed, but here we filter out duplicate guid:s from the items (or else
        // the lists will break because they use guids as :key and that has to be unique)
        const uniqueItems = [];
        const map = new Map();
        for (const item of items) {
            if (!map.has(item.guid)) {
                map.set(item.guid, true);    // set any value to Map
                uniqueItems.push(item);
            } else {
                console.log("Ignoring item: " + item.title);
            }
        }
        return { feed: feed, items: uniqueItems };
    }
}