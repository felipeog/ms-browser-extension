import axios from '../node_modules/axios'

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
  const scale = [0, 150, 600, 750, 800]
  const colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02']
  const closestScale = scale.reduce(function (previous, current) {
    if (Math.abs(current - value) < Math.abs(previous - value)) {
      return current
    }

    return previous
  }, 0)
  const scaleIndex = scale.findIndex((scale) => scale > closestScale)
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
    console.log(error)

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
  resultElements.errors.style.display = 'none'
  resultElements.errors.textContent = ''
  resultElements.loading.style.display = 'none'
  resultElements.results.style.display = 'none'
  resultElements.changeRegionButton.style.display = 'none'
}

function renderError(message) {
  hideAllElements()

  resultElements.changeRegionButton.style.display = 'block'
  resultElements.errors.style.display = 'block'
  resultElements.errors.textContent = message
}

function renderLoading() {
  hideAllElements()

  resultElements.loading.style.display = 'block'
  resultElements.changeRegionButton.style.display = 'block'
}

function renderForm() {
  hideAllElements()

  formElements.form.style.display = 'block'
}

async function renderResults(regionMetrics, regionName) {
  hideAllElements()

  const co2 = Math.round(regionMetrics.carbonIntensity)
  const fossilFuel = regionMetrics.fossilFuelPercentage.toFixed(2)

  resultElements.results.style.display = 'block'
  resultElements.myRegion.textContent = regionName
  resultElements.carbonUsage.textContent = `${co2} grams (grams C02 emitted per kilowatt hour)`
  resultElements.fossilFuel.textContent = `${fossilFuel} % (percentage of fossil fuels used to generate electricity)`
  resultElements.changeRegionButton.style.display = 'block'
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

  setUser(formElements.apiInput.value, formElements.regionInput.value)
  renderLoading()

  const regionMetrics = await fetchRegionMetrics(
    formElements.apiInput.value,
    formElements.regionInput.value
  )

  if (regionMetrics.error) {
    renderError(regionMetrics.message)
  } else {
    const co2 = regionMetrics ? Math.floor(regionMetrics.carbonIntensity) : 0
    const co2ScaleColor = getCo2ScaleColor(co2)

    setIconColor(co2ScaleColor)
    renderResults(regionMetrics, formElements.regionInput.value)
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
      const co2 = regionMetrics ? Math.floor(regionMetrics.carbonIntensity) : 0
      const co2ScaleColor = getCo2ScaleColor(co2)

      setIconColor(co2ScaleColor)
      renderResults(regionMetrics, user.regionName)
    }
  }
}

init()
