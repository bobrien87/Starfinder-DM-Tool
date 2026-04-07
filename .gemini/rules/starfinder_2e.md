# Starfinder Second Edition (SF2e) Rules

When working on this project (Starfinder DM Tool), you must **strictly adhere** to Starfinder Second Edition mechanics, terminology, and design paradigms.

## Core Directives
1. **Canonical Reference:** All rules, classes, ancestries, items, and mechanics must be sourced from the Starfinder 2e Playtest / Final Rules via the exact subdomain: `https://2e.aonsrd.com/`. Do not pull information from the root domain (`aonsrd.com`) as that contains First Edition rules.
2. **Pathfinder 2e Engine:** SF2e operates on the Pathfinder 2e underlying engine. If a mechanic is not explicitly defined in SF2e, assume the PF2e variant (e.g., the 3-Action economy, degrees of success, and proficiency systems).
3. **Obsolete Mechanics (Do Not Use):** 
   - Ensure you do not use split Armor Classes (do not use "EAC" or "KAC", use standard "AC").
   - Do not reference 1st Edition Stamina or Resolve Points systems unless explicitly brought up by the user for a homebrew addition.
   - Do not reference flat-footed; use the SF2e/PF2e Remastered term "Off-Guard".
4. **Structured JSON Source:** When importing or generating structured JSON entities (monsters, items, spells), the canonical source for raw game data is the official Foundry VTT systems repository at `https://github.com/foundryvtt/pf2e/tree/v13-dev/packs/sf2e`. 

## Data Structure Enforcement
Whenever defining database schemas, TypeScript interfaces, or mock data, ensure all properties conform to these SF2e mechanics. If you need raw data, pull JSON from the Foundry VTT GitHub repository. If you are unsure of how a mechanic functions, you must cross-reference `https://2e.aonsrd.com/`.
