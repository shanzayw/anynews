import Dexie from 'dexie';

const db = new Dexie('nuusdb');

// IF YOU CHANGE HERE, DO IT IN SERVICE WORKER CODE AS WELL!!!
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

db.getMediaFile = async function(url) {
    if (url == null) {
        return Promise.resolve(null);
    }
    return await db.media.get(url);
}

db.getFeed = async function(url) {
    if (url == null) {
        return Promise.resolve(null);
    }
    return await db.feeds.get(url);
}

db.storeFeed = async function(feedModel) {
    if (feedModel.url == null || feedModel.url == "") {
        console.log("Feed url not set, abort store operation");
        return;
    }
    return await db.feeds.put(feedModel);
}

db.getFeedItems = async function(feedModel) {
    if (feedModel.url == null || feedModel.url == "") {
        return [];
    }
    return await db.items.where("feed").equals(feedModel.url).toArray();
}

db.getSWLogs = async function() {
    return await db.log_sw.toArray();
}

db.clearSWLogs = async function() {
    return await db.log_sw.clear();
}

export default db;