import BaseLogger from "./empty";
import { CleanInsights, ConsentRequestUi } from 'clean-insights-sdk';

class RequestUi extends ConsentRequestUi {
    showForCampaign(campaignId, campaign, complete) {
        const period = campaign.nextTotalMeasurementPeriod
        if (!period) {
            return ''
        }
        let message = 'Help us improve!\n\n'
            + `We would like to collect anonymous usage data between ${period.start.format('LLL')} and ${period.end.format('LLL')} to improve the quality of the product.\n\nYour help would be highly appreciated.`

        complete(window.confirm(message))
        return ''
    }
}

export default class CleanInsightsLogger extends BaseLogger {
    constructor(config) {
        super();

        // Check that all log functions are implemented!
        let thisProto = Object.getPrototypeOf(this);
        let parentProto = Object.getPrototypeOf(thisProto);
        let thisFunctions = Object.getOwnPropertyNames(thisProto).filter(item => typeof this[item] === 'function' && item !== 'constructor');
        let parentFunctions = Object.getOwnPropertyNames(parentProto).filter(item => typeof this[item] === 'function' && item !== 'constructor');
        for (const f of parentFunctions) {
            if (!thisFunctions.includes(f)) {
                console.warn("Error: log function not implemented: " + f + "!!!");
            }
        }

        this.ci = new CleanInsights(config);

        // Get name of first campaign in the config.
        this.campaignId = Object.keys(config.campaigns || { invalid: {} })[0];
    }

    doIfHasConsent(callback) {
        if (!this.ci) {
            return;
        }
        if (!this.requestUi) {
            this.requestUi = new RequestUi();
        }
        this.ci.requestConsentForCampaign(this.campaignId, this.requestUi, (granted) => {
            if (!granted) {
                return
            }
            callback()
        })
    }

    logPageView(pageName) {
        this.doIfHasConsent(() => {
            this.ci.measureVisit([pageName], this.campaignId);
        })
    }
    logHeaderTagSelected(tag) {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("event", "tag_selected", this.campaignId, tag);
        })
    }
    logArticleView(item) {
        this.doIfHasConsent(() => {
            item = item || {}
            this.ci.measureEvent("article", "viewed", this.campaignId, item.title || item.guid);
        })
    }
    logVideoListView() {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("view", "video_list", this.campaignId);
        })
    }
    logAudioListView() {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("view", "audio_list", this.campaignId);
        })
    }
    logAppFirstLoad() {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("app", "first_load", this.campaignId);
        })
    }
    logAppLoad() {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("app", "load", this.campaignId);
        })
    }
    logAppExit() {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("app", "exit", this.campaignId);
        })
    }
    logAppError() {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("app", "error", this.campaignId);
        })
    }
    logAppUpdated(newVersion) {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("app", "updated", this.campaignId, newVersion);
        })
    }
    logFlavorSelect(flavor, ignoredFromSettings) {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("event", "flavor_selected", this.campaignId, flavor);
        })
    }
    logFetchError(url) {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("event", "fetch_error", this.campaignId, url);
        })
    }
    logArticleFavorited(item, ignoredType) {
        this.doIfHasConsent(() => {
            item = item || {}
            this.ci.measureEvent("article", "favorited", this.campaignId, item.title || item.guid);
        })
    }
    logArticleDownload(item, ignoredType) {
        this.doIfHasConsent(() => {
            item = item || {}
            this.ci.measureEvent("article", "downloaded", this.campaignId, item.title || item.guid);
        })
    }
    logTextSizeSelect(newSize) {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("event", "setting", this.campaignId, "text_size", newSize);
        })
    }
    logClosePlayer(item, ignoredType) {
        item = item || {}
        this.ci.measureEvent("media", "close_player", this.campaignId, item.title || item.guid);
    }
    logNavigation(pageName) {
        this.doIfHasConsent(() => {
            this.ci.measureEvent("event", "navigation", this.campaignId, pageName);
        })
    }
    logMediaPlay(item) {
        item = item || {}
        this.ci.measureEvent("media", "play", this.campaignId, item.title || item.guid);
    }
    logMediaPause(item) {
        item = item || {}
        this.ci.measureEvent("media", "pause", this.campaignId, item.title || item.guid);
    }
    logMediaComplete(item) {
        item = item || {}
        this.ci.measureEvent("media", "complete", this.campaignId, item.title || item.guid);
    }
}
