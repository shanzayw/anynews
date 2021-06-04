import MediaCache from "../mediacache";
import sanitizeHTML from 'sanitize-html';

export default class Printer extends Object {

    docDefinition = {
        pageSize: {
            width: 595.28,
            height: 841.89,
            orientation: "portrait"
        },
        pageMargins: [20, 20, 20, 20],
        content: [],
        styles: {
            title: {
                fontSize: 30,
                bold: true
            },
            description: {
                fontSize: 18
            },
            body: {
                fontSize: 15
            },
            bold: {
                bold: true
            },
            italic: {
                italics: true
            }
        }
    };
    isItalic = false;
    isBold = false;

    constructor(item, callback) {
        super();
        this.getMediaAndParseItem(item, callback);
    }

    getMediaAndParseItem = function (item, callback) {
        const self = this;
        if (item.imageSrc != null) {
            MediaCache.getMedia(item.imageSrc, false, function (url) {
                const img = document.createElement("img");
                img.crossOrigin = "Anonymous";
                img.onload = function () {

                    // Draw the IMG on a canvas
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    var base64 = canvas.toDataURL();
                    var width = self.docDefinition.pageSize.width - self.docDefinition.pageMargins[0] - self.docDefinition.pageMargins[2];
                    self.image = { image: base64, width: width, margin: [0, 0, 0, 20] };
                    self.docDefinition.content.push(self.image);

                    self.parseItem(item);
                    MediaCache.releaseMedia(url);
                    callback(self.docDefinition);
                };
                img.onerror = function () {
                    console.log("Error");
                    self.parseItem(item);
                    MediaCache.releaseMedia(url);
                    callback(self.docDefinition);
                };
                console.log("Set source to ");
                console.log(url);
                img.src = url;
            });
        } else {
            self.parseItem(item);
            callback(self.docDefinition);
        }
    }

    parseItem = function (item) {
        const self = this;
        self.docDefinition.content.push({ text: item.title, style: 'title', margin: [0, 0, 0, 20] });
        var el = document.createElement('div');
        if (item.description != null && item.description.length > 0) {
            el.innerHTML = item.description;
            self.docDefinition.content.push({ text: el.innerText, style: 'description', margin: [0, 0, 0, 20] });
        }
        el.innerHTML = this.sanitizeContent(item.content);
        self.parseP(el);
    }

    sanitizeContent(content) {
        return sanitizeHTML(content, {
            allowedTags: ['b', 'i', 'em', 'strong'],
            allowedAttributes: {
            },
        });
    }

    parseP = function (rootNode) {
        const self = this;
        if (rootNode.children) {
            for (const node of rootNode.childNodes) {
                if (node.nodeType == 3) {
                    // Text
                    var styles = ['body'];
                    if (self.isBold) {
                        styles.push("bold");
                    }
                    if (self.isItalic) {
                        styles.push("italic");
                    }
                    self.docDefinition.content.push({ text: node.nodeValue.trim(), style: styles });
                } else if (node.nodeType == 1) {
                    // Element
                    if (node.nodeName == "BR") {
                        self.docDefinition.content.push({ text: " ", fontSize: 5 });
                    }
                    else if (node.nodeName == "STRONG" || node.nodeName == "B") {
                        const old = self.isBold;
                        self.isBold = true;
                        self.parseP(node);
                        self.isBold = old;
                    }
                    else if (node.nodeName == "I" || node.nodeName == "EM") {
                        const old = self.isItalic;
                        self.isItalic = true;
                        self.parseP(node);
                        self.isItalic = old;
                    }
                }
            }
        }
    }
}
