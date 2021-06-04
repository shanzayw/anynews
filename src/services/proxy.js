import '../../public/proxies.js'
/* eslint-disable */
ProxyHandler.useDevServer = false;
window.getCurrentProxy = ProxyHandler.getCurrentProxy;
window.moveToNextProxy = ProxyHandler.moveToNextProxy;
export default ProxyHandler;
