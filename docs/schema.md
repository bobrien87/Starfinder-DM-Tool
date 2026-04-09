# Database Schema: Starfinder DM Tool

This document outlines the NoSQL Firestore database schema utilized for the Starfinder DM Tool. When adding new features or adjusting the database, ensure that we adhere to these structures.

---

## Collections

### 1. `campaigns`
Top-level collection for organizing entire campaigns.

- `id`: (String) Auto-generated document ID
- `title`: (String) "The Swarm Invasion"
- `description`: (String) Brief synopsis
- `status`: (String) "Active", "Completed", "Inactive"
- `createdAt`: (Timestamp)
- `updatedAt`: (Timestamp)

---

### 2. `players`
To track the Player Characters (PCs) playing in the campaign. Often attached as a subcollection under `campaigns/{campaignId}/players` to keep them scoped.

- `id`: (String)
- `characterName`: (String)
- `playerName`: (String)
- `ancestry`: (String) e.g., "Shirren", "Vesk"
- `heritage`: (String) 
- `background`: (String) e.g., "Bounty Hunter"
- `class`: (String) e.g., "Operative", "Soldier"
- `level`: (Number)
- `size`: (String) e.g., "Medium", "Small"
- `traits`: (Array of Strings) e.g., ["Humanoid", "Vesk"]

**Health & Points:**
- `hp`: (Object)
  - `current`: (Number)
  - `max`: (Number)
  - `temp`: (Number)
- `heroPoints`: (Number)

**Attributes (Modifiers):**
- `attributes`: (Object)
  - `str`: (Number) e.g., +4
  - `dex`: (Number)
  - `con`: (Number)
  - `int`: (Number)
  - `wis`: (Number)
  - `cha`: (Number)

**Defenses:**
- `ac`: (Number) Armor Class
- `saves`: (Object)
  - `fortitude`: (Number)
  - `reflex`: (Number)
  - `will`: (Number)
- `immunities`: (Array of Strings)
- `weaknesses`: (Array of Strings)
- `resistances`: (Array of Strings)

**Volatile State:**
- `conditions`: (Array of Objects)
  - `name`: (String) E.g., "Off-Guard", "Frightened"
  - `value`: (Number) E.g., 1 for Frightened 1 (optional)
  - `duration`: (Number) Rounds remaining (optional, use -1 for permanent)
  - `sourceInstanceId`: (String) Who applied it (optional)

**Core Proficiencies:**
- `perception`: (Number)
- `classDC`: (Number)
- `speeds`: (Array of Objects) E.g., `[{ type: "land", value: 25 }, { type: "fly", value: 20 }]`

**Skills:**
- `skills`: (Object Key/Value Pair)
  *Key format: e.g., "acrobatics", "computers", "piloting"*
  - `modifier`: (Number) Total modifier (e.g., +8)
  - `rank`: (Number) 0=Untrained, 1=Trained, 2=Expert, 3=Master, 4=Legendary

**Features & Abilities:**
- `feats`: (Object containing Arrays of Strings/Objects)
  - `ancestry`: (Array)
  - `class`: (Array)
  - `general`: (Array)
  - `skill`: (Array)
- `spellcasting`: (Array of Objects) Independent spellcasting entries, matching Creature schema structure (Focus, Innate, Prepared).
- `conditions`: (Array of Objects) Persistent states tracked on standard encounters
  - `name`: (String)
  - `value`: (Number)
  - `duration`: (Number)

**Inventory & Gear:**
- `credits`: (Number)
- `inventory`: (Array of Objects)
  - `itemId`: (String) Reference ID to `items` collection
  - `quantity`: (Number)
  - `equipped`: (Boolean)
- `weapons`: (Array of Objects)
  - `itemId`: (String) Reference to `items`
  - `equipped`: (Boolean)
- `armor`: (String) Reference ID to `items`

---

### 3. `encounters`
Tracks combat and social encounters, maintaining full state persistence for pausing and resuming.

**Meta Data**
- `id`: (String)
- `campaignId`: (String) Reference to parent campaign
- `title`: (String) "Akiton Ambush"
- `type`: (String) "Combat", "Social", "Exploration"
- `xpBudget`: (Number) Encounter difficulty budget (PF2e/SF2e engine)
- `status`: (String) "Planned", "Active", "Paused", "Completed"
- `environment`: (String) e.g., "Zero-G", "Vacuum"
- `notes`: (String)

**Combat State (Persistence)**
- `round`: (Number) Current combat round (0 if not started)
- `activeTurnId`: (String) The ID of the combatant whose turn it currently is
- `initiativePillars`: (Array of Strings) Global environmental effects affecting initiative.

**Combatants Array**
- `combatants`: (Array of Objects) Instances of PCs and Creatures in this encounter.
  - `instanceId`: (String) Unique UUID for this specific combatant instance.
  - `refId`: (String) Reference to the `players` or `creatures` collection.
  - `type`: (String) "PC" or "Creature"
  - `name`: (String) Name (can be overridden, e.g., "Sniper (Red)")
  - `initiative`: (Number) Rolled initiative value.
  - `isDelaying`: (Boolean) True if holding their turn.
  - `isDefeated`: (Boolean) True if dying/dead.
  
  *Volatile States (Creature only. PCs use global states mounted under their 'players' entry):*
  - `hp`: (Object)
    - `current`: (Number)
    - `temp`: (Number)
  - `conditions`: (Array of Objects)
    - `name`: (String) E.g., "Off-Guard", "Frightened"
    - `value`: (Number) E.g., 1 for Frightened 1 (optional)
    - `duration`: (Number) Rounds remaining (optional, use -1 for permanent)
    - `sourceInstanceId`: (String) Who applied it (optional)

---

### 4. `creatures`
Non-player characters and monsters mapped to SF2e/PF2e statblocks.

- `id`: (String)
- `name`: (String)
- `level`: (Number)
- `description`: (String) Optional flavor text / lore

**Identification & Senses**
- `traits`: (Array of Strings) SF2e traits (e.g., "Construct", "Large", "Uncommon")
- `perception`: (Number) Perception Modifier
- `senses`: (Array of Strings) E.g., ["Darkvision", "Tremorsense 30 ft."]
- `languages`: (Array of Strings) E.g., ["Common", "Akitonian"]
- `skills`: (Object Key/Value Pair)
  - *Key*: Skill name (e.g., "Acrobatics")
  - *Value*: Total modifier (e.g., +15)

**Attributes (Modifiers)**
- `attributes`: (Object) { `str`, `dex`, `con`, `int`, `wis`, `cha` } (Numbers)

**Defenses**
- `ac`: (Number) Standard Armor Class
- `saves`: (Object) { `fortitude`, `reflex`, `will` } (Numbers)
- `hp`: (Number) Maximum Hit Points
- `immunities`: (Array of Strings) E.g., ["Fire", "Critical Hits"]
- `weaknesses`: (Array of Objects) `{ type: "Cold", value: 5 }`
- `resistances`: (Array of Objects) `{ type: "Slashing", value: 10 }`

**Speed**
- `speeds`: (Array of Objects) E.g., `[{ type: "land", value: 25 }, { type: "fly", value: 40 }]`

**Offense: Strikes**
- `attacks`: (Array of Objects) Includes melee, ranged, and tech
  - `weapon`: (String) Name of attack (e.g., "Energy Pike")
  - `type`: (String) "Melee" or "Ranged"
  - `bonus`: (Number) Base attack modifier
  - `damage`: (String) Standard notation (e.g., "2d8 E")
  - `traits`: (Array of Strings) E.g., ["Reach", "Agile", "Tech"]

**Offense: Magic & Tech Abilities**
- `spellcasting`: (Array of Objects) Independent spellcasting entries (e.g. Focus, Innate, Prepared)
  - `id`: (String) Random UI-generated string for array keying
  - `name`: (String) e.g., "Innate Arcane Spells"
  - `tradition`: (String) "Arcane", "Divine", "Primal", "Occult", "None"
  - `type`: (String) "Prepared", "Spontaneous", "Innate", "Focus"
  - `ability`: (String) "int", "wis", "cha"
  - `proficiency`: (Number) 0=Untrained, 1=Trained, 2=Expert, 3=Master, 4=Legendary
  - `dc`: (Number) Hardcoded override (Prioritized for NPCs)
  - `attack`: (Number) Hardcoded override (Prioritized for NPCs)
  - `spellsByLevel`: (Object) keys: 0 through 10
    - `slots`: (Number) Max slots for this level (e.g., 3)
    - `spells`: (Array of Strings) Spell IDs from the `spells` collection
- `actions`: (Array of Objects) Active and reactive abilities
  - `name`: (String) E.g., "System Override"
  - `actionCost`: (String) E.g., "1", "2", "3", "free", "reaction"
  - `description`: (String) Full text evaluation of the mechanic
  - `traits`: (Array of Strings) E.g., ["Auditory", "Emotion"]
- `passives`: (Array of Objects) Passive traits and auras
  - `name`: (String) E.g., "Reactive Strike"
  - `description`: (String) Full text evaluation of the mechanic
  - `traits`: (Array of Strings) E.g., ["Tech"]

**Inventory**
- `items`: (Array of Strings) Reference IDs to `items` collection

---

### 5. `spells`
Global compendium tracking SF2e spells and magical/tech powers.

- `id`: (String)
- `name`: (String)
- `level`: (Number) Spell level (0 = Cantrip)
- `traditions`: (Array of Strings) E.g., ["Arcane", "Divine", "Primal"]
- `castTime`: (String) E.g., "2 Actions", "Reaction"
- `range`: (String)
- `area`: (String) E.g., "20-foot burst", "30-foot cone"
- `target`: (String)
- `duration`: (String) E.g., "1 minute", "Sustained up to 1 minute"
- `isSustained`: (Boolean) True if the spell requires an action to maintain
- `savingThrow`: (String) E.g., "Basic Reflex DC"
- `saveDegrees`: (Object - Optional) Pre-formatted evaluation text
  - `criticalSuccess`: (String)
  - `success`: (String)
  - `failure`: (String)
  - `criticalFailure`: (String)
- `damage`: (String - Optional) E.g., "6d6 F", "1d4+1 force"
- `trigger`: (String - Optional) Condition required for casting (common on reactions)
- `requirements`: (String - Optional) Pre-requisites for casting
- `description`: (String) Complete rules text
- `traits`: (Array of Strings) E.g., ["Fire", "Concentrate", "Manipulate"]

---

### 6. `items`
Global compendium tracking SF2e weapons, armor, and gear.

- `id`: (String)
- `name`: (String)
- `level`: (Number) Item level
- `type`: (String) "Weapon", "Armor", "Consumable", "Gear"
- `bulk`: (String) E.g., "L", "1", "2"
- `price`: (Number) Credit value
- `description`: (String) Rules and flavor text
- `traits`: (Array of Strings) E.g., ["Analog", "Tech", "Agile"]
- `weaponData`: (Object - Optional) 
  - `damage`: (String) E.g., "1d6 F"
  - `category`: (String) "Simple", "Martial", "Advanced"
  - `group`: (String) "Laser", "Projectile"
  - `range`: (String) E.g., "100 ft.", "melee"
  - `capacity`: (Number) E.g., 20
  - `usage`: (Number) E.g., 2
  - `reload`: (String) E.g., "1 Action"
- `armorData`: (Object - Optional)
  - `acBonus`: (Number)
  - `dexCap`: (Number)
  - `strengthReq`: (Number)
  - `speedPenalty`: (Number)

---

### 7. `loot`
Generic tracking for items, credits, and gear handed out to the party.

- `id`: (String)
- `campaignId`: (String)
- `itemName`: (String)
- `level`: (Number) Gear level
- `bulk`: (String) "L", "1", etc.
- `quantity`: (Number) E.g., 50
- `value`: (Number) Credit value
- `claimedBy`: (String) Player ID, or "Party Cache"
