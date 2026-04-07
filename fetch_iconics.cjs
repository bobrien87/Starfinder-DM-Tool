async function go() {
  const urls = [
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/iconics/iseph/iseph-level-1.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/iconics/navasi/navasi-level-1.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/iconics/obozaya/obozaya-level-1.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/iconics/zemir/zemir-level-1.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/iconics/dae/dae-level-1.json'
  ];

  const results = [];

  for (const url of urls) {
    const res = await fetch(url);
    const json = await res.json();
    
    results.push({
      characterName: json.name.replace(' (Level 1)', ''),
      playerName: "Pregen",
      level: 1,
      ancestry: "Unknown", // Needs manual input or deep parse
      class: "Unknown", // Needs manual input or parse
      hp: { 
         current: json.system?.attributes?.hp?.max || 10, 
         max: json.system?.attributes?.hp?.max || 10,
         temp: 0
      },
      skills: {}, // Default empty map
      abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }
    });
  }

  console.log(JSON.stringify(results, null, 2));
}
go();
