import axios from '../node_modules/axios'

// form fields
const form = document.querySelector('.form-data')
const regionName = document.querySelector('.region-name')
const apiKey = document.querySelector('.api-key')

// results
const errors = document.querySelector('.errors')
const loading = document.querySelector('.loading')
const results = document.querySelector('.result-container')
const carbonUsage = document.querySelector('.carbon-usage')
const fossilFuel = document.querySelector('.fossil-fuel')
const myRegion = document.querySelector('.my-region')
const clearButton = document.querySelector('.clear-btn')

function calculateColor(value) {
  const co2Scale = [0, 150, 600, 750, 800]
  const colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02']
  const closestNum = co2Scale.sort((a, b) => {
    return Math.abs(a - value) - Math.abs(b - value)
  })[0]
  const num = (element) => element > closestNum
  const scaleIndex = co2Scale.findIndex(num)
  const closestColor = colors[scaleIndex]

  chrome.runtime.sendMessage({
    action: 'updateIcon',
    value: { color: closestColor },
  })
}

async function displayCarbonUsage(apiKey, region) {
  try {
    await axios
      .get('https://api.co2signal.com/v1/latest', {
        params: {
          countryCode: region,
        },
        headers: {
          'auth-token': apiKey,
        },
      })
      .then((response) => {
        const CO2 = Math.floor(response.data.data.carbonIntensity)

        calculateColor(CO2)

        loading.style.display = 'none'
        form.style.display = 'none'
        myRegion.textContent = region
        carbonUsage.textContent =
          Math.round(response.data.data.carbonIntensity) +
          ' grams (grams C02 emitted per kilowatt hour)'
        fossilFuel.textContent =
          response.data.data.fossilFuelPercentage.toFixed(2) +
          '% (percentage of fossil fuels used to generate electricity)'
        results.style.display = 'block'
      })
  } catch (error) {
    console.error(error)

    loading.style.display = 'none'
    results.style.display = 'none'
    errors.textContent =
      'Sorry, we have no data for the region you have requested.'
  }
}

function setUpUser(apiKey, regionName) {
  localStorage.setItem('apiKey', apiKey)
  localStorage.setItem('regionName', regionName)

  loading.style.display = 'block'
  errors.textContent = ''
  clearButton.style.display = 'block'

  displayCarbonUsage(apiKey, regionName)
}

function handleSubmit(e) {
  e.preventDefault()

  setUpUser(apiKey.value, regionName.value)
}

function init() {
  const storedApiKey = localStorage.getItem('apiKey')
  const storedRegion = localStorage.getItem('regionName')

  chrome.runtime.sendMessage({
    action: 'updateIcon',
    value: {
      color: 'green',
    },
  })

  if (!storedApiKey || !storedRegion) {
    form.style.display = 'block'
    results.style.display = 'none'
    loading.style.display = 'none'
    clearButton.style.display = 'none'
    errors.textContent = ''
  } else {
    displayCarbonUsage(storedApiKey, storedRegion)

    results.style.display = 'none'
    form.style.display = 'none'
    clearButton.style.display = 'block'
  }
}

function reset(e) {
  e.preventDefault()

  localStorage.removeItem('regionName')

  init()
}

form.addEventListener('submit', (event) => {
  handleSubmit(event)
})

clearButton.addEventListener('click', (event) => {
  reset(event)
})

init()
