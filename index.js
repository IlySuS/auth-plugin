import auth from './modules/auth.js'

const webkitAuthPlugin = {
  install: (app, options) => {
    auth.defaultOptions = { ...auth.defaultOptions, ...options }
    app.config.globalProperties.$auth = auth
  }
}

export default webkitAuthPlugin

export {
  auth
}
