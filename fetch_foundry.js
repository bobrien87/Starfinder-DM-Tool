
async function go() {
  const urls = [
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/alien-core-bestiary/aeon-guard-trooper.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/alien-core-bestiary/akata.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/alien-core-bestiary/assembly-ooze.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/alien-core-bestiary/barachius-angel.json',
    'https://raw.githubusercontent.com/foundryvtt/pf2e/v13-dev/packs/sf2e/alien-core-bestiary/diatha.json'
  ];

  const results = [];

  for (const url of urls) {
    const res = await fetch(url);
    const json = await res.json();
    
    let attacks = [];
    if (json.items) {
      json.items.forEach(item => {
        if (item.type === 'melee') {
          // Foundry VTT separates melee/ranged strikes under type: 'melee' with properties (e.g. system.weaponType.value === 'ranged')
	  // Or just grab name and a generic damage string
          const damageParts = item.system.damageRolls ? Object.values(item.system.damageRolls).map(d => `${d.damage} ${d.damageType}`).join(' + ') : '1d6 M';
          const bonus = item.system.bonus ? item.system.bonus.value : 0;
          attacks.push({
            name: item.name,
            bonus: bonus,
            damage: damageParts || '1d4',
            traits: item.system.traits?.value || []
          });
        }
      });
    }

    results.push({
      name: json.name,
      level: json.system.details?.level?.value || 1,
      rarity: json.system.traits?.rarity ? json.system.traits.rarity.charAt(0).toUpperCase() + json.system.traits.rarity.slice(1) : 'Common',
      traits: json.system.traits?.value || [],
      hp: { current: json.system.attributes?.hp?.value || 10, max: json.system.attributes?.hp?.value || 10 },
      ac: json.system.attributes?.ac?.value || 10,
      saves: {
        fortitude: json.system.saves?.fortitude?.value || 0,
        reflex: json.system.saves?.reflex?.value || 0,
        will: json.system.saves?.will?.value || 0
      },
      attacks: attacks
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

go();
