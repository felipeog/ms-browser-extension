export const User = {
  set(apiKey, regionName) {
    localStorage.setItem('apiKey', apiKey)
    localStorage.setItem('regionName', regionName)
  },

  get() {
    const apiKey = localStorage.getItem('apiKey')
    const regionName = localStorage.getItem('regionName')

    if (!apiKey || !regionName) {
      return null
    }

    return {
      apiKey,
      regionName,
    }
  },

  reset() {
    localStorage.removeItem('apiKey')
    localStorage.removeItem('regionName')
  },
}
