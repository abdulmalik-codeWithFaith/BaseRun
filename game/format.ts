export const formatDistance = (m: number) =>
  m < 1000 ? `${Math.floor(m)} m` : `${(m / 1000).toFixed(2)} km`;