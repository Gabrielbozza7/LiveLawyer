export let coords: { lat: number; lon: number } | null = null

export function setCoordinates(newCoords: { lat: number; lon: number }) {
  coords = newCoords
}

export function getCoordinates(): { lat: number; lon: number } | null {
  return coords
}
