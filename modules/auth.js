export const defaultOptions = {
  axios: null,
  store: null,
}

export const auth = {
  login(data) {
    return defaultOptions.axios.post('auth/authorize', data)
      .then(response => response.data)
  },

  profile() {
    return defaultOptions.axios.get('profiles/me')
      .then(response => response.data)
  },

  authenticated() {
    return defaultOptions.store.getters['auth/authenticated']
  },

  getToken() {
    return defaultOptions.store.getters['auth/accessToken']
  },

  refreshToken() {
    return defaultOptions.axios.post('auth/authorize_restore', {
      expire_token: defaultOptions.store.getters['auth/expireToken']
    }).then(response => {
      console.log(response, 'REFRESH TOKEN')
      defaultOptions.store.commit('auth/setAccessToken', response.data.access_token)
      defaultOptions.store.commit('auth/setExpireToken', response.data.expire_token)
      this.setAxiosInstanse()
    })
  },

  logout() {
    defaultOptions.store.dispatch('auth/clearAuthInfo')
  },

  setAxiosInstanse() {
    defaultOptions.axios.defaults.baseURL = process.env.VUE_APP_BASE_URL
    defaultOptions.axios.defaults.responseType = 'json'
  
    setResponseSettings()
  
    if (this.authenticated()) {
      defaultOptions.axios.defaults.headers['X-Lamb-Auth-Token'] = `${this.getToken()}`
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
            originalRequest.headers['X-Lamb-Auth-Token'] = `${this.getToken()}`
            return defaultOptions.axios(originalRequest)
          }).catch(err => {
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        return new Promise(function (resolve, reject) {
          this.refreshToken()
            .then(() => {
              if (error.response.status === 401 && error.response.data.error_code === 7) {
                this.logout()
                window.location.href = '/'
              }

              const token = `${this.getToken()}`
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
