// Fetches correct iNaturalist photo URLs for each creature
// Run with: node fix_images.mjs

const creatures = [
  "Clownfish", "Blue Tang", "Green Sea Turtle", "Hawksbill Sea Turtle",
  "Manta Ray", "Whale Shark", "Nurse Shark", "Blacktip Reef Shark",
  "Hammerhead Shark", "Moray Eel", "Octopus", "Giant Pacific Octopus",
  "Blue-ringed Octopus", "Cuttlefish", "Nautilus", "Lionfish",
  "Stonefish", "Leafy Sea Dragon", "Seahorse", "Pufferfish",
  "Parrotfish", "Humphead Wrasse", "Clown Triggerfish", "Barracuda",
  "Giant Grouper", "Stingray", "Spotted Eagle Ray", "Electric Ray",
  "Moon Jellyfish", "Lion's Mane Jellyfish", "Box Jellyfish",
  "California Sea Lion", "Bottlenose Dolphin", "Sperm Whale",
  "Humpback Whale", "Dugong", "Spanish Dancer Nudibranch",
  "Chromodoris Nudibranch", "Frogfish", "Mantis Shrimp", "Spiny Lobster",
  "Decorator Crab", "Porcelain Crab", "Crown-of-Thorns Starfish",
  "Long-spined Sea Urchin", "Sea Cucumber", "Crinoid feather star",
  "Basket Star", "Giant Clam", "Cone Snail", "Polyclad Flatworm",
  "Christmas Tree Worm", "Cleaner Shrimp", "Harlequin Shrimp",
  "Mimic Octopus", "Dinoflagellate bioluminescent",
  "Wobbegong Shark", "Bumphead Parrotfish", "Tasseled Wobbegong", "Oarfish"
];

const results = []

for (const name of creatures) {
  try {
    const res = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=1&order=desc&order_by=observations_count`,
      { headers: { 'Accept': 'application/json' } }
    )
    const json = await res.json()
    const taxon = json.results?.[0]
    const photo = taxon?.default_photo?.medium_url ?? null
    results.push({ name, photo, taxon_name: taxon?.name })
    process.stdout.write('.')
  } catch (e) {
    results.push({ name, photo: null, error: e.message })
    process.stdout.write('x')
  }
  await new Promise(r => setTimeout(r, 300)) // be nice to the API
}

console.log('\n\n--- RESULTS ---')
for (const r of results) {
  console.log(`${r.name} → ${r.taxon_name ?? 'NOT FOUND'}: ${r.photo ?? 'NO PHOTO'}`)
}
