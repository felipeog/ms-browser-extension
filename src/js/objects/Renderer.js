export const Renderer = {
  formElements: {
    form: document.querySelector('.form-data'),
    regionInput: document.querySelector('.region-name'),
    apiInput: document.querySelector('.api-key'),
  },

  resultElements: {
    errors: document.querySelector('.errors'),
    loading: document.querySelector('.loading'),
    results: document.querySelector('.result-container'),
    carbonUsage: document.querySelector('.carbon-usage'),
    fossilFuel: document.querySelector('.fossil-fuel'),
    myRegion: document.querySelector('.my-region'),
    changeRegionButton: document.querySelector('.change-region'),
  },

  getCo2ScaleColor(value) {
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
  },

  setIconColor(color) {
    chrome.runtime.sendMessage({
      action: 'updateIcon',
      value: { color },
    })
  },

  hideAllElements() {
    this.formElements.form.style.display = 'none'
    this.resultElements.changeRegionButton.style.display = 'none'
    this.resultElements.errors.style.display = 'none'
    this.resultElements.errors.textContent = ''
    this.resultElements.loading.style.display = 'none'
    this.resultElements.results.style.display = 'none'
  },

  renderError(message) {
    this.hideAllElements()

    this.resultElements.changeRegionButton.style.display = 'block'
    this.resultElements.errors.style.display = 'block'
    this.resultElements.errors.textContent = message
  },

  renderLoading() {
    this.hideAllElements()

    this.resultElements.changeRegionButton.style.display = 'block'
    this.resultElements.loading.style.display = 'block'
  },

  renderForm() {
    this.hideAllElements()

    this.formElements.form.style.display = 'block'
  },

  async renderResults({ metrics, name }) {
    this.hideAllElements()

    const co2 = Math.round(metrics.carbonIntensity)
    const fossilFuel = metrics.fossilFuelPercentage.toFixed(2)

    this.resultElements.carbonUsage.textContent = `${co2} grams (grams C02 emitted per kilowatt hour)`
    this.resultElements.changeRegionButton.style.display = 'block'
    this.resultElements.fossilFuel.textContent = `${fossilFuel} % (percentage of fossil fuels used to generate electricity)`
    this.resultElements.myRegion.textContent = name
    this.resultElements.results.style.display = 'block'
  },
}
