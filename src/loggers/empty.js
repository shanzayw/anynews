/**
 * Base class for logging.
 */
export default class EmptyLogger {
    logPageView(ignoredPageName) { }
    logHeaderTagSelected(ignoredTag) { }
    logArticleView(ignoredItem) { }
    logVideoListView() { }
    logAudioListView() { }
    logAppFirstLoad() { }
    logAppLoad() { }
    logAppExit() { }
    logAppError() { }
    logAppUpdated(ignoredNewVersion) { }
    logFlavorSelect(ignoredFlavor, ignoredFromSettings) { }
    logFetchError(ignoredUrl) { }
    logArticleFavorited(ignoredItem, ignoredType) { }
    logArticleDownload(ignoredItem, ignoredType) { }
    logTextSizeSelect(ignoredNewSize) { }
    logClosePlayer(ignoredItem, ignoredType) { }
    logNavigation(ignoredPageName) { }
    logMediaPlay(ignoredItem) { }
    logMediaPause(ignoredItem) { }
    logMediaComplete(ignoredItem) { }
}
