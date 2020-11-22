import { z } from 'zorium'
import cookieLib from 'cookie'
import LocationRouter from 'location-router'
import socketIO from 'socket.io-client/dist/socket.io.slim.js'
import CookieService from 'frontend-shared/services/cookie'
import LanguageService from 'frontend-shared/services/language'
import PortalService from 'frontend-shared/services/portal'
import RouterService from 'frontend-shared/services/router'
import WindowService from 'frontend-shared/services/window'
import fontsCss from 'frontend-shared/components/head/fonts'

import GlobalContext from '../src/context'
import Lang from '../src/lang'
import Model from '../src/models'
import colors from '../src/colors'
import config from '../src/config'

export const decorators = [
  ($story) => {
    const language = 'en'
    const initialCookies = cookieLib.parse(document.cookie)
    const userAgent = globalThis?.navigator?.userAgent
    const io = socketIO(config.API_HOST, {
      path: (config.API_PATH || '') + '/socket.io',
      // this potentially has negative side effects. firewalls could
      // potentially block websockets, but not long polling.
      // unfortunately, session affinity on kubernetes is a complete pain.
      // behind cloudflare, it seems to unevenly distribute load.
      // the libraries for sticky websocket sessions between cpus
      // also aren't great - it's hard to get the real ip sent to
      // the backend (easy as http-forwarded-for, hard as remote address)
      // and the only library that uses forwarded-for isn't great....
      // see kaiser experiments for how to pass source ip in gke, but
      // it doesn't keep session affinity (for now?) if adding polling
      transports: ['websocket']
    })
    const cookie = new CookieService({
      initialCookies,
      host: window.location.host,
      setCookie (key, value, options) {
        document.cookie = cookieLib.serialize(key, value, options)
      }
    })
    console.log('_---', config.ENVS.PROD, config.ENV)
    const lang = new LanguageService({
      language,
      cookie,
      // prod uses bundled language json
      files: config.ENV === config.ENVS.PROD
        ? window.languageStrings
        : Lang.getLangFiles()
    })
    const portal = new PortalService({
      lang,
      iosAppUrl: config.IOS_APP_URL,
      googlePlayAppUrl: config.GOOGLE_PLAY_APP_URL
    })
    const browser = new WindowService({ cookie, userAgent })
    const model = new Model({
      io,
      portal,
      lang,
      cookie,
      userAgent,
      product: config.APP_KEY,
      authCookie: config.AUTH_COOKIE,
      apiUrl: config.API_URL,
      host: window.location.host
    })

    const router = new RouterService({
      model,
      cookie,
      lang,
      portal,
      router: new LocationRouter(),
      host: window.location.host
    })

    return z(GlobalContext.Provider, {
      value: { model, router, portal, lang, cookie, browser, config, colors }
    }, [
      z($fonts),
      z($cssVars),
      z($story)
    ])
  }
];

function $cssVars () {
  return z('style', {
    type: 'text/css',
    innerHTML: `:root {${colors.getCssVariables()}}`
  })
}

function $fonts () {
  return z('style', {
    type: 'text/css',
    innerHTML: fontsCss
  })
}
