export function calculateDiveNumbers(dives) {
  const sorted = [...dives].sort((a, b) => new Date(a.date) - new Date(b.date))
  const map = {}
  sorted.forEach((dive, i) => {
    map[dive.id] = i + 1
  })
  return map
}
