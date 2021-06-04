import MediaCache from "../mediacache";

export default class ItemModel extends Object {
    constructor(o) {
        super();
        if (typeof (o) === 'object') {
            this.feed = o.feed;
            this.title = o.title;
            this.link = o.link;
            this.guid = o.guid;
            this.description = o.description;
            this.pubDate = o.pubDate;
            this.author = o.author;
            this.content = o.content;
            this.imageSrc = o.imageSrc;
            this.enclosure = o.enclosure;
            this.enclosureType = o.enclosureType;
            this.category = o.category;
            this.categoryDisplay = o.categoryDisplay;
            this.tags = o.tags;
            this.savedByUser = o.savedByUser;
            this.isLive = o.isLive;
            this.channelTitle = o.channelTitle;
            this.channelDescription = o.channelDescription;
        }
    }

    // The feed this item is part of
    feed = null;

    title = "";
    link = "";
    guid = "";
    description = "";
    pubDate = null;
    author = "";
    content = "";
    imageSrc = null;
    enclosure = "";
    enclosureType = "";
    category = "";
    tags = "";
    
    // Superfeed properties
    channelTitle = "";
    channelDescription = "";

    // Display name for category. Can be changed e.g. if we want to use different category name for an item if it is
    // in the "main list" or in the category view (the original "category" above will stay the same)
    categoryDisplay = null;

    // Date when this item was saved. If null, it is not saved by the user.
    savedByUser = null;

    // True for RADIO
    isLive = false;

    hasVideoAttachment = function () {
        return (
            this.enclosureType != null && this.enclosureType.indexOf("video") === 0
        );
    }

    hasAudioAttachment = function () {
        return (
            this.enclosureType != null && this.enclosureType.indexOf("audio") === 0
        );
    }

    getCategoryName = function() {
        if (this.categoryDisplay !== undefined && this.categoryDisplay != null && this.categoryDisplay.length > 0) {
            return this.categoryDisplay;
        } else if (this.category !== undefined && this.category != null && this.category.length > 0) {
            return this.category;
        }
        return "";
    }

    downloadMedia = function () {
        MediaCache.getMedia(this.imageSrc, true, null);
        MediaCache.getMedia(this.enclosure, true, null, function() {
            window.logger.logArticleDownload(this, this.hasVideoAttachment() ? "video" : "audio");
        }.bind(this));
    }

    deleteDownloadedMedia = function() {
        MediaCache.deleteMedia(this.imageSrc);
        MediaCache.deleteMedia(this.enclosure);
    }

    serialize = function () {
        var itemObject = JSON.stringify(this, function (key, value) {
            // Filtering out functions
            if (typeof value === 'function') {
                return undefined;
            } else if (key === 'downloadTokens') {
                return undefined;
            }
            return value;
        });
        return itemObject;
    }

    static fromString = function (objectString) {
        var object = JSON.parse(objectString);
        return new ItemModel(object);
    }
}