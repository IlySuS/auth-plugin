import auth from './auth.js'
import defaultOptions from './defaultOptions.js'

export default {
  setAxiosInstanse() {
    defaultOptions.axios.defaults.baseURL = process.env.VUE_APP_BASE_URL
    defaultOptions.axios.defaults.responseType = 'json'

    this.setResponseSettings()

    if (auth.authenticated()) {
      defaultOptions.axios.defaults.headers['X-Lamb-Auth-Token'] = `${auth.getToken()}`
    }
  },

  setResponseSettings() {
    let isRefreshing = false
    let failedQueue = []

    const processQueue = (error, token = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error)
        } else {
          prom.resolve(token)
        }
      })

      failedQueue = []
    }

    defaultOptions.axios.interceptors.response.use(function (response) {
      return response
    }, function (error) {

      const originalRequest = error.config

      if (error.response.status === 401
        && !originalRequest._retry
        && error.response.data.error_message !== 'User password or email is invalid') {

        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({resolve, reject})
          }).then(() => {
            originalRequest.headers['X-Lamb-Auth-Token'] = `${auth.getToken()}`
            return defaultOptions.axios(originalRequest)
          }).catch(err => {
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        return new Promise(function (resolve, reject) {
          auth.refreshToken()
            .then(() => {
              if (error.response.status === 401 && error.response.data.error_code === 7) {
                auth.logout()
                window.location.href = `${defaultOptions.logoutUrl}`
              }

              const token = `${auth.getToken()}`
              defaultOptions.axios.defaults.headers.common['X-Lamb-Auth-Token'] = token
              originalRequest.headers['X-Lamb-Auth-Token'] = token
              processQueue(null, token)
              resolve(defaultOptions.axios(originalRequest))
            })
            .catch((err) => {
              processQueue(err, null)
              reject(err)
            })
            .finally(() => { isRefreshing = false })
        })
      }

      return Promise.reject(error)
    })
  }
}
