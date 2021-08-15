function set(apiKey, regionName) {
  localStorage.setItem('apiKey', apiKey)
  localStorage.setItem('regionName', regionName)
}

function get() {
  const apiKey = localStorage.getItem('apiKey')
  const regionName = localStorage.getItem('regionName')

  if (!apiKey || !regionName) {
    return null
  }

  return {
    apiKey,
    regionName,
  }
}

function reset() {
  localStorage.removeItem('apiKey')
  localStorage.removeItem('regionName')
}

export default {
  set,
  get,
  reset,
}
