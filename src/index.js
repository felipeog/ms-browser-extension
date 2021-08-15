import axios from 'axios'

// dom elements
const formElements = {
  form: document.querySelector('.form-data'),
  regionInput: document.querySelector('.region-name'),
  apiInput: document.querySelector('.api-key'),
}

const resultElements = {
  errors: document.querySelector('.errors'),
  loading: document.querySelector('.loading'),
  results: document.querySelector('.result-container'),
  carbonUsage: document.querySelector('.carbon-usage'),
  fossilFuel: document.querySelector('.fossil-fuel'),
  myRegion: document.querySelector('.my-region'),
  changeRegionButton: document.querySelector('.change-region'),
}

// icon handling
function getCo2ScaleColor(value) {
  const scaleValues = [0, 200, 400, 600, 800]
  const colors = ['#05995F', '#ECCD55', '#C27C3D', '#913627', '#331907']
  const closestValue = scaleValues.reduce((previous, current) => {
    if (Math.abs(current - value) < Math.abs(previous - value)) {
      return current
    }

    return previous
  }, 0)
  const scaleIndex = scaleValues.findIndex((value) => value === closestValue)
  const color = colors[scaleIndex]

  return color
}

function setIconColor(color) {
  chrome.runtime.sendMessage({
    action: 'updateIcon',
    value: { color },
  })
}

// data fetching
async function fetchRegionMetrics(apiKey, regionName) {
  try {
    const response = await axios.get('https://api.co2signal.com/v1/latest', {
      params: {
        countryCode: regionName,
      },
      headers: {
        'auth-token': apiKey,
      },
    })

    return response.data.data
  } catch (error) {
    console.error(error)

    return {
      error: true,
      message:
        'Error! Please, check your region name and API key, and try again.',
    }
  }
}

// rendering
function hideAllElements() {
  formElements.form.style.display = 'none'
  resultElements.changeRegionButton.style.display = 'none'
  resultElements.errors.style.display = 'none'
  resultElements.errors.textContent = ''
  resultElements.loading.style.display = 'none'
  resultElements.results.style.display = 'none'
}

function renderError(message) {
  hideAllElements()

  resultElements.changeRegionButton.style.display = 'block'
  resultElements.errors.style.display = 'block'
  resultElements.errors.textContent = message
}

function renderLoading() {
  hideAllElements()

  resultElements.changeRegionButton.style.display = 'block'
  resultElements.loading.style.display = 'block'
}

function renderForm() {
  hideAllElements()

  formElements.form.style.display = 'block'
}

async function renderResults({ metrics, name }) {
  hideAllElements()

  const co2 = Math.round(metrics.carbonIntensity)
  const fossilFuel = metrics.fossilFuelPercentage.toFixed(2)

  resultElements.carbonUsage.textContent = `${co2} grams (grams C02 emitted per kilowatt hour)`
  resultElements.changeRegionButton.style.display = 'block'
  resultElements.fossilFuel.textContent = `${fossilFuel} % (percentage of fossil fuels used to generate electricity)`
  resultElements.myRegion.textContent = name
  resultElements.results.style.display = 'block'
}

// user handling
function setUser(apiKey, regionName) {
  localStorage.setItem('apiKey', apiKey)
  localStorage.setItem('regionName', regionName)
}

function getUser() {
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

function resetUser() {
  localStorage.removeItem('apiKey')
  localStorage.removeItem('regionName')
}

// event handlers
async function handleFormSubmit(event) {
  event.preventDefault()

  const apiKey = formElements.apiInput.value
  const regionName = formElements.regionInput.value

  setUser(apiKey, regionName)
  renderLoading()

  const regionMetrics = await fetchRegionMetrics(apiKey, regionName)

  if (regionMetrics.error) {
    renderError(regionMetrics.message)
  } else {
    const co2ScaleColor = getCo2ScaleColor(
      Math.floor(regionMetrics.carbonIntensity)
    )

    setIconColor(co2ScaleColor)
    renderResults({ metrics: regionMetrics, name: regionName })
  }
}

function handleRegionReset(event) {
  event.preventDefault()

  resetUser()
  setIconColor('green')
  renderForm()
}

// events
formElements.form.addEventListener('submit', handleFormSubmit)
resultElements.changeRegionButton.addEventListener('click', handleRegionReset)

// initialize
async function init() {
  const user = getUser()

  if (!user) {
    setIconColor('green')
    renderForm()
  } else {
    renderLoading()

    const regionMetrics = await fetchRegionMetrics(user.apiKey, user.regionName)

    if (regionMetrics.error) {
      renderError(regionMetrics.message)
    } else {
      const co2ScaleColor = getCo2ScaleColor(
        Math.floor(regionMetrics.carbonIntensity)
      )

      setIconColor(co2ScaleColor)
      renderResults({ metrics: regionMetrics, name: user.regionName })
    }
  }
}

init()
