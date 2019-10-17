import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import App from '../App.vue'
import { windowWidth } from '../services/window_utils/window_utils'
import { getOrCreateApp, getClientToken } from '../services/new_api/oauth.js'
import backendInteractorService from '../services/backend_interactor_service/backend_interactor_service.js'

const getStatusnetConfig = async ({ store }) => {
  try {
    const res = await window.fetch('/api/statusnet/config.json')
    if (res.ok) {
      const data = await res.json()
      const { name, closed: registrationClosed, textlimit, uploadlimit, server, vapidPublicKey, safeDMMentionsEnabled } = data.site

      store.dispatch('setInstanceOption', { name: 'name', value: name })
      store.dispatch('setInstanceOption', { name: 'registrationOpen', value: (registrationClosed === '0') })
      store.dispatch('setInstanceOption', { name: 'textlimit', value: parseInt(textlimit) })
      store.dispatch('setInstanceOption', { name: 'server', value: server })
      store.dispatch('setInstanceOption', { name: 'safeDM', value: safeDMMentionsEnabled !== '0' })

      // TODO: default values for this stuff, added if to not make it break on
      // my dev config out of the box.
      if (uploadlimit) {
        store.dispatch('setInstanceOption', { name: 'uploadlimit', value: parseInt(uploadlimit.uploadlimit) })
        store.dispatch('setInstanceOption', { name: 'avatarlimit', value: parseInt(uploadlimit.avatarlimit) })
        store.dispatch('setInstanceOption', { name: 'backgroundlimit', value: parseInt(uploadlimit.backgroundlimit) })
        store.dispatch('setInstanceOption', { name: 'bannerlimit', value: parseInt(uploadlimit.bannerlimit) })
      }

      if (vapidPublicKey) {
        store.dispatch('setInstanceOption', { name: 'vapidPublicKey', value: vapidPublicKey })
      }

      return data.site.pleromafe
    } else {
      throw (res)
    }
  } catch (error) {
    console.error('Could not load statusnet config, potentially fatal')
    console.error(error)
  }
}

const getStaticConfig = async () => {
  try {
    const res = await window.fetch('/static/config.json')
    if (res.ok) {
      return res.json()
    } else {
      throw (res)
    }
  } catch (error) {
    console.warn('Failed to load static/config.json, continuing without it.')
    console.warn(error)
    return {}
  }
}

const setSettings = async ({ apiConfig, staticConfig, store }) => {
  const overrides = window.___pleromafe_dev_overrides || {}
  const env = window.___pleromafe_mode.NODE_ENV

  // This takes static config and overrides properties that are present in apiConfig
  let config = {}
  if (overrides.staticConfigPreference && env === 'development') {
    console.warn('OVERRIDING API CONFIG WITH STATIC CONFIG')
    config = Object.assign({}, apiConfig, staticConfig)
  } else {
    config = Object.assign({}, staticConfig, apiConfig)
  }

  const copyInstanceOption = (name) => {
    store.dispatch('setInstanceOption', { name, value: config[name] })
  }

  copyInstanceOption('nsfwCensorImage')
  copyInstanceOption('background')
  copyInstanceOption('hidePostStats')
  copyInstanceOption('hideUserStats')
  copyInstanceOption('hideFilteredStatuses')
  copyInstanceOption('logo')

  store.dispatch('setInstanceOption', {
    name: 'logoMask',
    value: typeof config.logoMask === 'undefined'
      ? true
      : config.logoMask
  })

  store.dispatch('setInstanceOption', {
    name: 'logoMargin',
    value: typeof config.logoMargin === 'undefined'
      ? 0
      : config.logoMargin
  })
  store.commit('authFlow/setInitialStrategy', config.loginMethod)

  copyInstanceOption('redirectRootNoLogin')
  copyInstanceOption('redirectRootLogin')
  copyInstanceOption('showInstanceSpecificPanel')
  copyInstanceOption('minimalScopesMode')
  copyInstanceOption('hideMutedPosts')
  copyInstanceOption('collapseMessageWithSubject')
  copyInstanceOption('scopeCopy')
  copyInstanceOption('subjectLineBehavior')
  copyInstanceOption('postContentType')
  copyInstanceOption('alwaysShowSubjectInput')
  copyInstanceOption('noAttachmentLinks')
  copyInstanceOption('showFeaturesPanel')

  return store.dispatch('setTheme', config['theme'])
}

const getTOS = async ({ store }) => {
  try {
    const res = await window.fetch('/static/terms-of-service.html')
    if (res.ok) {
      const html = await res.text()
      store.dispatch('setInstanceOption', { name: 'tos', value: html })
    } else {
      throw (res)
    }
  } catch (e) {
    console.warn("Can't load TOS")
    console.warn(e)
  }
}

const getInstancePanel = async ({ store }) => {
  try {
    const res = await window.fetch('/instance/panel.html')
    if (res.ok) {
      const html = await res.text()
      store.dispatch('setInstanceOption', { name: 'instanceSpecificPanelContent', value: html })
    } else {
      throw (res)
    }
  } catch (e) {
    console.warn("Can't load instance panel")
    console.warn(e)
  }
}

const getStickers = async ({ store }) => {
  try {
    const res = await window.fetch('/static/stickers.json')
    if (res.ok) {
      const values = await res.json()
      const stickers = (await Promise.all(
        Object.entries(values).map(async ([name, path]) => {
          const resPack = await window.fetch(path + 'pack.json')
          var meta = {}
          if (resPack.ok) {
            meta = await resPack.json()
          }
          return {
            pack: name,
            path,
            meta
          }
        })
      )).sort((a, b) => {
        return a.meta.title.localeCompare(b.meta.title)
      })
      store.dispatch('setInstanceOption', { name: 'stickers', value: stickers })
    } else {
      throw (res)
    }
  } catch (e) {
    console.warn("Can't load stickers")
    console.warn(e)
  }
}

const getStaticEmoji = async ({ store }) => {
  try {
    const res = await window.fetch('/static/emoji.json')
    if (res.ok) {
      const values = await res.json()
      const emoji = Object.keys(values).map((key) => {
        return {
          displayText: key,
          imageUrl: false,
          replacement: values[key]
        }
      }).sort((a, b) => a.displayText - b.displayText)
      store.dispatch('setInstanceOption', { name: 'emoji', value: emoji })
    } else {
      throw (res)
    }
  } catch (e) {
    console.warn("Can't load static emoji")
    console.warn(e)
  }
}

// This is also used to indicate if we have a 'pleroma backend' or not.
// Somewhat weird, should probably be somewhere else.
const getCustomEmoji = async ({ store }) => {
  try {
    const res = await window.fetch('/api/pleroma/emoji.json')
    if (res.ok) {
      const result = await res.json()
      const values = Array.isArray(result) ? Object.assign({}, ...result) : result
      const emoji = Object.entries(values).map(([key, value]) => {
        const imageUrl = value.image_url
        return {
          displayText: key,
          imageUrl: imageUrl ? store.state.instance.server + imageUrl : value,
          tags: imageUrl ? value.tags.sort((a, b) => a > b ? 1 : 0) : ['utf'],
          replacement: `:${key}: `
        }
        // Technically could use tags but those are kinda useless right now, should have been "pack" field, that would be more useful
      }).sort((a, b) => a.displayText.toLowerCase() > b.displayText.toLowerCase() ? 1 : 0)
      store.dispatch('setInstanceOption', { name: 'customEmoji', value: emoji })
      store.dispatch('setInstanceOption', { name: 'pleromaBackend', value: true })
    } else {
      throw (res)
    }
  } catch (e) {
    store.dispatch('setInstanceOption', { name: 'pleromaBackend', value: false })
    console.warn("Can't load custom emojis, maybe not a Pleroma instance?")
    console.warn(e)
  }
}

const getAppSecret = async ({ store }) => {
  const { state, commit } = store
  const { oauth, instance } = state
  return getOrCreateApp({ ...oauth, instance: instance.server, commit })
    .then((app) => getClientToken({ ...app, instance: instance.server }))
    .then((token) => {
      commit('setAppToken', token.access_token)
      commit('setBackendInteractor', backendInteractorService(store.getters.getToken()))
    })
}

const getNodeInfo = async ({ store }) => {
  try {
    const res = await window.fetch('/nodeinfo/2.0.json')
    if (res.ok) {
      const data = await res.json()
      const metadata = data.metadata
      const features = metadata.features
      store.dispatch('setInstanceOption', { name: 'mediaProxyAvailable', value: features.includes('media_proxy') })
      store.dispatch('setInstanceOption', { name: 'chatAvailable', value: features.includes('chat') })
      store.dispatch('setInstanceOption', { name: 'gopherAvailable', value: features.includes('gopher') })
      store.dispatch('setInstanceOption', { name: 'pollsAvailable', value: features.includes('polls') })
      store.dispatch('setInstanceOption', { name: 'pollLimits', value: metadata.pollLimits })
      store.dispatch('setInstanceOption', { name: 'mailerEnabled', value: metadata.mailerEnabled })

      store.dispatch('setInstanceOption', { name: 'restrictedNicknames', value: metadata.restrictedNicknames })
      store.dispatch('setInstanceOption', { name: 'postFormats', value: metadata.postFormats })

      const suggestions = metadata.suggestions
      store.dispatch('setInstanceOption', { name: 'suggestionsEnabled', value: suggestions.enabled })
      store.dispatch('setInstanceOption', { name: 'suggestionsWeb', value: suggestions.web })

      const software = data.software
      store.dispatch('setInstanceOption', { name: 'backendVersion', value: software.version })

      const frontendVersion = window.___pleromafe_commit_hash
      store.dispatch('setInstanceOption', { name: 'frontendVersion', value: frontendVersion })
      store.dispatch('setInstanceOption', { name: 'tagPolicyAvailable', value: metadata.federation.mrf_policies.includes('TagPolicy') })
    } else {
      throw (res)
    }
  } catch (e) {
    console.warn('Could not load nodeinfo')
    console.warn(e)
  }
}

const setConfig = async ({ store }) => {
  // apiConfig, staticConfig
  const configInfos = await Promise.all([getStatusnetConfig({ store }), getStaticConfig()])
  const apiConfig = configInfos[0]
  const staticConfig = configInfos[1]

  await setSettings({ store, apiConfig, staticConfig }).then(getAppSecret({ store }))
}

const checkOAuthToken = async ({ store }) => {
  return new Promise(async (resolve, reject) => {
    if (store.getters.getUserToken()) {
      try {
        await store.dispatch('loginUser', store.getters.getUserToken())
      } catch (e) {
        console.log(e)
      }
    }
    resolve()
  })
}

const afterStoreSetup = async ({ store, i18n }) => {
  if (store.state.config.customTheme) {
    // This is a hack to deal with async loading of config.json and themes
    // See: style_setter.js, setPreset()
    window.themeLoaded = true
    store.dispatch('setOption', {
      name: 'customTheme',
      value: store.state.config.customTheme
    })
  }

  const width = windowWidth()
  store.dispatch('setMobileLayout', width <= 800)

  // Now we can try getting the server settings and logging in
  await Promise.all([
    checkOAuthToken({ store }),
    setConfig({ store }),
    getTOS({ store }),
    getInstancePanel({ store }),
    getStickers({ store }),
    getStaticEmoji({ store }),
    getCustomEmoji({ store }),
    getNodeInfo({ store })
  ])

  const router = new VueRouter({
    mode: 'history',
    routes: routes(store),
    scrollBehavior: (to, _from, savedPosition) => {
      if (to.matched.some(m => m.meta.dontScroll)) {
        return false
      }
      return savedPosition || { x: 0, y: 0 }
    }
  })

  /* eslint-disable no-new */
  return new Vue({
    router,
    store,
    i18n,
    el: '#app',
    render: h => h(App)
  })
}

export default afterStoreSetup
