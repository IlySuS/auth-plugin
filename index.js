import auth from './modules/auth.js'

const webkitAuthPlugin = {
  install: (app) => {
    // auth.defaultOptions = { ...options }
    app.config.globalProperties.$auth = auth
  }
}

// Automatic Installation
// if (typeof window !== 'undefined' && window.Vue) {
//   window.Vue.use(webkitAuthPlugin)
// }

export default webkitAuthPlugin

export {
  auth
}
