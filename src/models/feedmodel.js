export default class FeedModel extends Object {
    constructor(o) {
        super();
        if (typeof (o) === 'object') {
            this.url = o.url;
            this.title = o.title;
            this.link = o.link;
            this.description = o.description;
            this.imageUrl = o.imageUrl;
            this.category = o.category;
        }
    }

    url = "";
    title = "";
    link = "";
    description = "";
    imageUrl = null;
    category = null;
}