import db from './database';

class MediaCache {
    // Map URL -> Object of type { blobUrl: blobUrl, count: numusers }
    blobUrls = {};

    // Map URL -> Download info of type { token: object, listeners: [] }
    downloadTokens = {};

    constructor() {
    }

    // Get a url for a piece of media. If the media is downloaded, create (or reuse) a
    // blob url. Otherwise, if 'download' is true, make sure to download it.
    // If 'callback' is null and 'download' is true the item will be downloaded, but
    // the blob url is never created.
    getMedia(url, download, callback, cbDownloadStarted) {
        const self = this;
        db.getMediaFile(url).then(function (blob) {
            if (blob == null || blob == undefined) {
                if (download) {
                    if (cbDownloadStarted !== undefined) {
                        cbDownloadStarted();
                    }
                    self.downloadMedia(url, function (url, blob) {
                        if (callback != null) {
                            callback(self.getUrlForBlob(url, blob));
                        }
                    });
                } else if (callback != null) {
                    callback(url);
                }
            } else if (callback != null) {
                callback(self.getUrlForBlob(url, blob.blob));
            }
        });
    }

    // Private function
    getUrlForBlob(url, blob) {
        let existing = this.blobUrls[url];
        if (existing != null) {
            existing.count += 1;
            return existing.blobUrl;
        } else {
            // Get a URL for the blob
            var myURL = window.URL || window.webkitURL;
            let blobUrl = myURL.createObjectURL(blob);
            this.blobUrls[url] = {blobUrl: blobUrl, count: 1};
            return blobUrl;
        }
    }

    releaseMedia(url) {
        let blobUrl = this.blobUrls[url];
        if (blobUrl != null) {
            blobUrl.count -= 1;
            if (blobUrl.count == 0) {
                delete this.blobUrls[url];

                var myURL = window.URL || window.webkitURL;
                console.log("Revoking: " + blobUrl.blobUrl);
                myURL.revokeObjectURL(blobUrl.blobUrl);
            }
        }
    }

    deleteMedia = function(url) {
        if (url == null) {
            return;
        }
        this.cancelDownload(url);
        db.media.where("url").equals(url).delete();
    }

    downloadMedia = function(url, success) {
        if (url == null) {
            return;
        }

        console.log("Download media item: " + url);

        let existingDownload = this.downloadTokens[url];
        if (existingDownload != null) {
            console.log("Existing download found, add callback");
            existingDownload.listeners.push(success);
            return;
        }

        const self = this;

        const CancelToken = window.axiosType.CancelToken;
        var token = CancelToken.source();
        this.downloadTokens[url] = {token: token, listeners: [success]};

        console.log("Cancel token is ");
        console.log(this.downloadTokens[url]);

        window.axios.get(url, {
            responseType: "blob",
            cancelToken: token.token
        }).then(function (response) {
            console.log("Add media to db");
            db.media.add({ url: url, blob: response.data });
            return response.data;
        }).then(function(blob) {
            let listeners = self.downloadTokens[url].listeners;
            delete self.downloadTokens[url];
            console.log("DL done - Calling listeners");
            console.log(listeners);
            for (var i = 0; i < listeners.length; i++) {
                console.log("Call one listener");
                listeners[i](url, blob);
            }
        }).catch(function (thrown) {
            delete self.downloadTokens[url];
            if (window.axiosType.isCancel(thrown)) {
                console.log('Request canceled', thrown.message);
            } else {
                // handle error
                console.log("Error");
                console.log(thrown.message);
            }
        });
    }

    cancelDownload = function (url) {
        let existingDownload = this.downloadTokens[url];
        if (existingDownload != null) {
            delete this.downloadTokens[url];
            existingDownload.token.cancel("Canceled by user");
        } 
    }
}

const singletonInstance = new MediaCache();
Object.freeze(singletonInstance);
export default singletonInstance;
