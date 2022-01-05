import { client } from './client'

const { locationsApi } = client

async function getDefaultLocations() {
  const {
    result: { locations },
  } = await locationsApi.listLocations()

  return locations
}

export async function getDefaultLocationId() {
  const locations = await getDefaultLocations()

  if (locations && locations[0].id) {
    return locations[0].id
  }

  return undefined
}
