/* eslint-env browser */
import { filter, trim } from 'lodash'

import TabSwitcher from '../tab_switcher/tab_switcher.js'
import StyleSwitcher from '../style_switcher/style_switcher.vue'
import InterfaceLanguageSwitcher from '../interface_language_switcher/interface_language_switcher.vue'
import { extractCommit } from '../../services/version/version.service'

const pleromaFeCommitUrl = 'https://git.pleroma.social/pleroma/pleroma-fe/commit/'
const pleromaBeCommitUrl = 'https://git.pleroma.social/pleroma/pleroma/commit/'

const settings = {
  data () {
    const user = this.$store.state.config
    const instance = this.$store.state.instance

    return {
      hideAttachmentsLocal: user.hideAttachments,
      padEmojiLocal: user.padEmoji,
      hideAttachmentsInConvLocal: user.hideAttachmentsInConv,
      maxThumbnails: user.maxThumbnails,
      hideNsfwLocal: user.hideNsfw,
      useOneClickNsfw: user.useOneClickNsfw,
      hideISPLocal: user.hideISP,
      preloadImage: user.preloadImage,

      hidePostStatsLocal: typeof user.hidePostStats === 'undefined'
        ? instance.hidePostStats
        : user.hidePostStats,
      hidePostStatsDefault: this.$t('settings.values.' + instance.hidePostStats),

      hideUserStatsLocal: typeof user.hideUserStats === 'undefined'
        ? instance.hideUserStats
        : user.hideUserStats,
      hideUserStatsDefault: this.$t('settings.values.' + instance.hideUserStats),

      hideFilteredStatusesLocal: typeof user.hideFilteredStatuses === 'undefined'
        ? instance.hideFilteredStatuses
        : user.hideFilteredStatuses,
      hideFilteredStatusesDefault: this.$t('settings.values.' + instance.hideFilteredStatuses),

      notificationVisibilityLocal: user.notificationVisibility,
      replyVisibilityLocal: user.replyVisibility,
      loopVideoLocal: user.loopVideo,
      muteWordsString: user.muteWords.join('\n'),
      autoLoadLocal: user.autoLoad,
      streamingLocal: user.streaming,
      pauseOnUnfocusedLocal: user.pauseOnUnfocused,
      hoverPreviewLocal: user.hoverPreview,
      autohideFloatingPostButtonLocal: user.autohideFloatingPostButton,

      hideMutedPostsLocal: typeof user.hideMutedPosts === 'undefined'
        ? instance.hideMutedPosts
        : user.hideMutedPosts,
      hideMutedPostsDefault: this.$t('settings.values.' + instance.hideMutedPosts),

      collapseMessageWithSubjectLocal: typeof user.collapseMessageWithSubject === 'undefined'
        ? instance.collapseMessageWithSubject
        : user.collapseMessageWithSubject,
      collapseMessageWithSubjectDefault: this.$t('settings.values.' + instance.collapseMessageWithSubject),

      subjectLineBehaviorLocal: typeof user.subjectLineBehavior === 'undefined'
        ? instance.subjectLineBehavior
        : user.subjectLineBehavior,
      subjectLineBehaviorDefault: instance.subjectLineBehavior,

      postContentTypeLocal: typeof user.postContentType === 'undefined'
        ? instance.postContentType
        : user.postContentType,
      postContentTypeDefault: instance.postContentType,

      alwaysShowSubjectInputLocal: typeof user.alwaysShowSubjectInput === 'undefined'
        ? instance.alwaysShowSubjectInput
        : user.alwaysShowSubjectInput,
      alwaysShowSubjectInputDefault: this.$t('settings.values.' + instance.alwaysShowSubjectInput),

      scopeCopyLocal: typeof user.scopeCopy === 'undefined'
        ? instance.scopeCopy
        : user.scopeCopy,
      scopeCopyDefault: this.$t('settings.values.' + instance.scopeCopy),

      minimalScopesModeLocal: typeof user.minimalScopesMode === 'undefined'
        ? instance.minimalScopesMode
        : user.minimalScopesMode,
      minimalScopesModeDefault: this.$t('settings.values.' + instance.minimalScopesMode),

      stopGifs: user.stopGifs,
      webPushNotificationsLocal: user.webPushNotifications,
      loopVideoSilentOnlyLocal: user.loopVideosSilentOnly,
      loopSilentAvailable:
        // Firefox
        Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, 'mozHasAudio') ||
        // Chrome-likes
        Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'webkitAudioDecodedByteCount') ||
        // Future spec, still not supported in Nightly 63 as of 08/2018
        Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'audioTracks'),
      playVideosInModal: user.playVideosInModal,
      useContainFit: user.useContainFit,

      backendVersion: instance.backendVersion,
      frontendVersion: instance.frontendVersion
    }
  },
  components: {
    TabSwitcher,
    StyleSwitcher,
    InterfaceLanguageSwitcher
  },
  computed: {
    user () {
      return this.$store.state.users.currentUser
    },
    currentSaveStateNotice () {
      return this.$store.state.interface.settings.currentSaveStateNotice
    },
    postFormats () {
      return this.$store.state.instance.postFormats || []
    },
    instanceSpecificPanelPresent () { return this.$store.state.instance.showInstanceSpecificPanel },
    frontendVersionLink () {
      return pleromaFeCommitUrl + this.frontendVersion
    },
    backendVersionLink () {
      return pleromaBeCommitUrl + extractCommit(this.backendVersion)
    }
  },
  watch: {
    hideAttachmentsLocal (value) {
      this.$store.dispatch('setOption', { name: 'hideAttachments', value })
    },
    padEmojiLocal (value) {
      this.$store.dispatch('setOption', { name: 'padEmoji', value })
    },
    hideAttachmentsInConvLocal (value) {
      this.$store.dispatch('setOption', { name: 'hideAttachmentsInConv', value })
    },
    hidePostStatsLocal (value) {
      this.$store.dispatch('setOption', { name: 'hidePostStats', value })
    },
    hideUserStatsLocal (value) {
      this.$store.dispatch('setOption', { name: 'hideUserStats', value })
    },
    hideFilteredStatusesLocal (value) {
      this.$store.dispatch('setOption', { name: 'hideFilteredStatuses', value })
    },
    hideNsfwLocal (value) {
      this.$store.dispatch('setOption', { name: 'hideNsfw', value })
    },
    useOneClickNsfw (value) {
      this.$store.dispatch('setOption', { name: 'useOneClickNsfw', value })
    },
    preloadImage (value) {
      this.$store.dispatch('setOption', { name: 'preloadImage', value })
    },
    hideISPLocal (value) {
      this.$store.dispatch('setOption', { name: 'hideISP', value })
    },
    'notificationVisibilityLocal.likes' (value) {
      this.$store.dispatch('setOption', { name: 'notificationVisibility', value: this.$store.state.config.notificationVisibility })
    },
    'notificationVisibilityLocal.follows' (value) {
      this.$store.dispatch('setOption', { name: 'notificationVisibility', value: this.$store.state.config.notificationVisibility })
    },
    'notificationVisibilityLocal.repeats' (value) {
      this.$store.dispatch('setOption', { name: 'notificationVisibility', value: this.$store.state.config.notificationVisibility })
    },
    'notificationVisibilityLocal.mentions' (value) {
      this.$store.dispatch('setOption', { name: 'notificationVisibility', value: this.$store.state.config.notificationVisibility })
    },
    replyVisibilityLocal (value) {
      this.$store.dispatch('setOption', { name: 'replyVisibility', value })
    },
    loopVideoLocal (value) {
      this.$store.dispatch('setOption', { name: 'loopVideo', value })
    },
    loopVideoSilentOnlyLocal (value) {
      this.$store.dispatch('setOption', { name: 'loopVideoSilentOnly', value })
    },
    autoLoadLocal (value) {
      this.$store.dispatch('setOption', { name: 'autoLoad', value })
    },
    streamingLocal (value) {
      this.$store.dispatch('setOption', { name: 'streaming', value })
    },
    pauseOnUnfocusedLocal (value) {
      this.$store.dispatch('setOption', { name: 'pauseOnUnfocused', value })
    },
    hoverPreviewLocal (value) {
      this.$store.dispatch('setOption', { name: 'hoverPreview', value })
    },
    autohideFloatingPostButtonLocal (value) {
      this.$store.dispatch('setOption', { name: 'autohideFloatingPostButton', value })
    },
    muteWordsString (value) {
      value = filter(value.split('\n'), (word) => trim(word).length > 0)
      this.$store.dispatch('setOption', { name: 'muteWords', value })
    },
    hideMutedPostsLocal (value) {
      this.$store.dispatch('setOption', { name: 'hideMutedPosts', value })
    },
    collapseMessageWithSubjectLocal (value) {
      this.$store.dispatch('setOption', { name: 'collapseMessageWithSubject', value })
    },
    scopeCopyLocal (value) {
      this.$store.dispatch('setOption', { name: 'scopeCopy', value })
    },
    alwaysShowSubjectInputLocal (value) {
      this.$store.dispatch('setOption', { name: 'alwaysShowSubjectInput', value })
    },
    subjectLineBehaviorLocal (value) {
      this.$store.dispatch('setOption', { name: 'subjectLineBehavior', value })
    },
    postContentTypeLocal (value) {
      this.$store.dispatch('setOption', { name: 'postContentType', value })
    },
    minimalScopesModeLocal (value) {
      this.$store.dispatch('setOption', { name: 'minimalScopesMode', value })
    },
    stopGifs (value) {
      this.$store.dispatch('setOption', { name: 'stopGifs', value })
    },
    webPushNotificationsLocal (value) {
      this.$store.dispatch('setOption', { name: 'webPushNotifications', value })
      if (value) this.$store.dispatch('registerPushNotifications')
    },
    playVideosInModal (value) {
      this.$store.dispatch('setOption', { name: 'playVideosInModal', value })
    },
    useContainFit (value) {
      this.$store.dispatch('setOption', { name: 'useContainFit', value })
    },
    maxThumbnails (value) {
      value = this.maxThumbnails = Math.floor(Math.max(value, 0))
      this.$store.dispatch('setOption', { name: 'maxThumbnails', value })
    }
  }
}

export default settings
