import { set } from 'vue'
import { setPreset } from '../services/style_setter/style_setter.js'

const defaultState = {
  // Stuff from static/config.json and apiConfig
  name: 'Pleroma FE',
  registrationOpen: true,
  safeDM: true,
  textlimit: 5000,
  server: 'http://localhost:4040/',
  theme: 'pleroma-dark',
  background: '/static/aurora_borealis.jpg',
  logo: '/static/logo.png',
  logoMask: true,
  logoMargin: '.2em',
  redirectRootNoLogin: '/main/all',
  redirectRootLogin: '/main/friends',
  showInstanceSpecificPanel: false,
  alwaysShowSubjectInput: true,
  hideMutedPosts: false,
  collapseMessageWithSubject: false,
  hidePostStats: false,
  hideUserStats: false,
  hideFilteredStatuses: false,
  disableChat: false,
  scopeCopy: true,
  subjectLineBehavior: 'email',
  postContentType: 'text/plain',
  nsfwCensorImage: undefined,
  vapidPublicKey: undefined,
  noAttachmentLinks: false,
  showFeaturesPanel: true,
  minimalScopesMode: false,

  // Nasty stuff
  pleromaBackend: true,
  emoji: [],
  customEmoji: [],
  restrictedNicknames: [],
  postFormats: [],

  // Feature-set, apparently, not everything here is reported...
  mediaProxyAvailable: false,
  chatAvailable: false,
  gopherAvailable: false,
  suggestionsEnabled: false,
  suggestionsWeb: '',

  // Html stuff
  instanceSpecificPanelContent: '',
  tos: '',

  // Version Information
  backendVersion: '',
  frontendVersion: '',

  pollsAvailable: false,
  pollLimits: {
    max_options: 4,
    max_option_chars: 255,
    min_expiration: 60,
    max_expiration: 60 * 60 * 24
  }
}

const instance = {
  state: defaultState,
  mutations: {
    setInstanceOption (state, { name, value }) {
      if (typeof value !== 'undefined') {
        set(state, name, value)
      }
    }
  },
  actions: {
    setInstanceOption ({ commit, dispatch }, { name, value }) {
      commit('setInstanceOption', { name, value })
      switch (name) {
        case 'name':
          dispatch('setPageTitle')
          break
        case 'chatAvailable':
          if (value) {
            dispatch('initializeSocket')
          }
          break
      }
    },
    setTheme ({ commit }, themeName) {
      commit('setInstanceOption', { name: 'theme', value: themeName })
      return setPreset(themeName, commit)
    }
  }
}

export default instance
