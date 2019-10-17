import { set, delete as del } from 'vue'
import { setPreset, applyTheme } from '../services/style_setter/style_setter.js'

const browserLocale = (window.navigator.language || 'en').split('-')[0]

const defaultState = {
  colors: {},
  hideMutedPosts: undefined, // instance default
  collapseMessageWithSubject: undefined, // instance default
  padEmoji: true,
  hideAttachments: false,
  hideAttachmentsInConv: false,
  maxThumbnails: 16,
  hideNsfw: true,
  preloadImage: true,
  loopVideo: true,
  loopVideoSilentOnly: true,
  autoLoad: true,
  streaming: false,
  hoverPreview: true,
  autohideFloatingPostButton: false,
  pauseOnUnfocused: true,
  stopGifs: false,
  replyVisibility: 'all',
  notificationVisibility: {
    follows: true,
    mentions: true,
    likes: true,
    repeats: true
  },
  webPushNotifications: false,
  muteWords: [],
  highlight: {},
  interfaceLanguage: browserLocale,
  hideScopeNotice: false,
  scopeCopy: undefined, // instance default
  subjectLineBehavior: undefined, // instance default
  alwaysShowSubjectInput: undefined, // instance default
  postContentType: undefined, // instance default
  minimalScopesMode: undefined // instance default
}

const config = {
  state: defaultState,
  mutations: {
    setOption (state, { name, value }) {
      set(state, name, value)
    },
    setHighlight (state, { user, color, type }) {
      const data = this.state.config.highlight[user]
      if (color || type) {
        set(state.highlight, user, { color: color || data.color, type: type || data.type })
      } else {
        del(state.highlight, user)
      }
    }
  },
  actions: {
    setHighlight ({ commit, dispatch }, { user, color, type }) {
      commit('setHighlight', { user, color, type })
    },
    setOption ({ commit, dispatch }, { name, value }) {
      commit('setOption', { name, value })
      switch (name) {
        case 'theme':
          setPreset(value, commit)
          break
        case 'customTheme':
          applyTheme(value, commit)
      }
    }
  }
}

export default config
