import axios from 'axios'

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
export default { fetchRegionMetrics }
