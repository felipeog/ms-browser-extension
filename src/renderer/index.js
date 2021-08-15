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

export default {
  getCo2ScaleColor,
  setIconColor,
  renderError,
  renderLoading,
  renderForm,
  renderResults,
  formElements,
  resultElements,
}
