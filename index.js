import defaultOptions from './modules/defaultOptions.js'
import auth from './modules/auth.js'
import axios from './modules/axios.js'

const webkitAuthPlugin = {
  install: (app, options) => {
    defaultOptions = { ...options }
    app.config.globalProperties.$auth = {...auth, ...axios}
  }
}

export default webkitAuthPlugin

export {
  auth,
  axios
}
