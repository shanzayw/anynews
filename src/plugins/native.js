import Vue from 'vue';

class NativeInterface {
    fromNative(message) {
        // Call this from native side by evaluating javascript.
        // For example, in swift, do: 
        // webView.evaluateJavaScript("window.native.fromNative('Hello');", in: nil, in: .page)
        console.log("From native: " + message);
    }

    toNative(message) {
        // Send message to native.
        // You can handle this message on native side.
        // For example, in Swift, implement:
        // func userContentController(_ userContentController: WKUserContentController, didReceive msg: WKScriptMessage) {
        //     // Make sure that your passed delegate is called
        //     if msg.name == "anynews" {
        //         if let message = msg.body as ?String {
        //             print(message)
        //         }
        //     }
        // }
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.anynews) {
            window.webkit.messageHandlers.anynews.postMessage(message);
        } else {
            console.error("Native not implemented");
        }
    }
}

const native = new NativeInterface();
window.native = native;

const nativePlugin = {
    install(Vue, options) {
        console.log(options);
        Object.defineProperty(Vue.prototype, '$native', {
            get() {
                native.$vue = this.$root;
                return native;
            }
        })
    }
}

Vue.use(nativePlugin);
export default nativePlugin;
