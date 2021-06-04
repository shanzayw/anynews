// eslint-disable-next-line
import ItemModel from "./models/itemmodel";

/**
 * Base class for logging.
 */
export default class Logger {
    logStateOnboardingScreen() { }
    logPageView(ignoredPageName) { }
    logHeaderTagSelected(ignoredTag) { }
    logArticleView(ignoredItem) { }
    logVideoListView() { }
    logAudioListView() { }
    logAppFirstLoad() { }
    logAppLoad() { }
    logAppExit() { }
    logAppError() { }
    logAppUpdated() { }
    logLanguageSelect(ignoredLanguage, ignoredFromSettings) { }
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
