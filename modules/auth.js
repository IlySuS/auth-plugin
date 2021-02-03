export default {
  

  login(data) {
    return this.defaultOptions.axios.post(`${this.defaultOptions.authUrl}`, data)
      .then(response => response.data)
  },

  profile() {
    return this.defaultOptions.axios.get('profiles/me')
      .then(response => response.data)
  },

  authenticated() {
    return this.defaultOptions.store.getters['auth/authenticated']
  },

  getToken() {
    return this.defaultOptions.store.getters['auth/accessToken']
  },

  refreshToken() {
    return this.defaultOptions.axios.post(`${this.defaultOptions.refreshTokenUrl}`, {
      expire_token: this.defaultOptions.store.getters['auth/expireToken']
    }).then(response => {
      console.log(response, 'REFRESH TOKEN')
      this.defaultOptions.store.commit('auth/setAccessToken', response.data.access_token)
      this.defaultOptions.store.commit('auth/setExpireToken', response.data.expire_token)
      this.setAxiosInstanse()
    })
  },

  logout() {
    this.defaultOptions.store.dispatch('auth/clearAuthInfo')
  },


}
