import { Api } from './api'
import { Renderer } from './renderer'
import { User } from './user'

// event handlers
async function handleFormSubmit(event) {
  event.preventDefault()

  const apiKey = Renderer.formElements.apiInput.value
  const regionName = Renderer.formElements.regionInput.value

  User.set(apiKey, regionName)
  Renderer.renderLoading()

  const regionMetrics = await Api.fetchRegionMetrics(apiKey, regionName)

  if (regionMetrics.error) {
    Renderer.renderError(regionMetrics.message)
  } else {
    const co2ScaleColor = Renderer.getCo2ScaleColor(
      Math.floor(regionMetrics.carbonIntensity)
    )

    Renderer.setIconColor(co2ScaleColor)
    Renderer.renderResults({ metrics: regionMetrics, name: regionName })
  }
}

function handleRegionReset(event) {
  event.preventDefault()

  User.reset()
  Renderer.setIconColor('green')
  Renderer.renderForm()
}

// events
Renderer.formElements.form.addEventListener('submit', handleFormSubmit)
Renderer.resultElements.changeRegionButton.addEventListener(
  'click',
  handleRegionReset
)

// initialize
async function init() {
  const user = User.get()

  if (!user) {
    Renderer.setIconColor('green')
    Renderer.renderForm()
  } else {
    Renderer.renderLoading()

    const regionMetrics = await Api.fetchRegionMetrics(
      user.apiKey,
      user.regionName
    )

    if (regionMetrics.error) {
      Renderer.renderError(regionMetrics.message)
    } else {
      const co2ScaleColor = Renderer.getCo2ScaleColor(
        Math.floor(regionMetrics.carbonIntensity)
      )

      Renderer.setIconColor(co2ScaleColor)
      Renderer.renderResults({ metrics: regionMetrics, name: user.regionName })
    }
  }
}

init()
