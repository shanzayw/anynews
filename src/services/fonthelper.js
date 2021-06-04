class FontHelper {
    generateFontFaceImports(fonts, elementId) {
        var id = elementId || "fontFaces";

        // Remove old, if present
        var css = document.getElementById(id);
        if (css != null) {
            document.head.removeChild(css);
        }

        if (fonts) {
            css = document.createElement("style");
            css.type = "text/css";
            css.id = id;

            var content = "";
            var fontPrefix = window.location.origin + window.location.pathname + "assets/fonts/";

            for (const fontName of Object.keys(fonts)) {
                const o = fonts[fontName];
                for (const type of Object.keys(o)) {
                    const path = o[type];
                    var format = "truetype";
                    if (path.toUpperCase().endsWith(".OTF")) {
                        format = "opentype";
                    }
                    var weight = 400;
                    var style = "normal";

                    switch (type) {
                        case "bold":
                            weight = 700;
                            break;
                        case "bolditalics":
                            weight = 700;
                            style = "italic";
                            break;
                        case "italics":
                            style = "italic";
                            break;
                    }

                    content += `
@font-face {
    font-family: '${fontName}';
    src: url('${fontPrefix}${path}') format('${format}');
    font-weight: ${weight};
    font-style: ${style};
}`;
                }
            }
            css.textContent = content;
            document.head.appendChild(css);
        }
    }

    styleForFonts(fonts) {
        if (fonts) {
            var fontName = "";
            for (var font of Object.keys(fonts)) {
                if (fontName.length > 0) {
                    fontName += ",";
                }
                fontName = fontName + font;
            }
            if (fontName.length > 0) {
                fontName += ",";
            }
            (fontName += "Roboto"), "sans-serif";
            return "font-family: " + fontName;
        }
        return "";
    }
}

var fontHelper = new FontHelper();
export default fontHelper;