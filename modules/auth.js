import defaultOptions from './defaultOptions.js'

export default {
  login(data) {
    return defaultOptions.axios.post(`${defaultOptions.authUrl}`, data)
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
    return defaultOptions.axios.post(`${defaultOptions.refreshTokenUrl}`, {
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
  }
}
