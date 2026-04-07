export const CONDITIONS = {
  // Core Value-Based Debuffs
  "Frightened": {
    desc: "You take a status penalty equal to the value to all your checks and DCs. At the end of each of your turns, the value of your frightened condition decreases by 1.",
    hasValue: true,
    decayAtEndOfTurn: true,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
      { target: "all_checks", type: "status", valueFn: (val) => -val },
      { target: "all_dcs", type: "status", valueFn: (val) => -val },
    ]
  },
  "Sickened": {
    desc: "You take a status penalty equal to this value on all your checks and DCs. You can't willingly ingest anything. Spend an action retching to attempt a Fortitude save to reduce the value.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: [
      { target: "all_checks", type: "status", valueFn: (val) => -val },
      { target: "all_dcs", type: "status", valueFn: (val) => -val }
    ]
  },
  "Drained": {
    desc: "You take a status penalty equal to your drained value on Constitution-based checks. Your maximum Hit Points are reduced by your level times your drained value.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: [
      { target: "fortitude", type: "status", valueFn: (val) => -val },
      { target: "max_hp", type: "raw", valueFn: (val, entity) => -(val * Math.max(1, entity?.level || 1)) }
    ]
  },
  "Enfeebled": {
    desc: "You take a status penalty equal to the condition value to Strength-based rolls and DCs, including Strength-based melee attack rolls, Strength-based damage rolls, and Athletics checks.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
      { target: "str_checks", type: "status", valueFn: (val) => -val },
      { target: "melee_damage", type: "status", valueFn: (val) => -val }
    ]
  },
  "Clumsy": {
    desc: "You take a status penalty equal to the condition value to Dexterity-based rolls and DCs, including AC, Reflex saves, ranged attack rolls, and Acrobatics, Stealth, and Thievery checks.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
      { target: "dex_checks", type: "status", valueFn: (val) => -val },
      { target: "ac", type: "status", valueFn: (val) => -val },
      { target: "reflex", type: "status", valueFn: (val) => -val }
    ]
  },
  "Stupefied": {
    desc: "You take a status penalty equal to this value on Intelligence-, Wisdom-, and Charisma-based checks and DCs, including Will saves, spell attack rolls, spell DCs, and skills.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: [
      { target: "spell_dc", type: "status", valueFn: (val) => -val },
      { target: "will", type: "status", valueFn: (val) => -val }
    ]
  },

  // Action / Turn Economy Debuffs
  "Slowed": {
    desc: "You have fewer actions. At the start of your turn, you lose a number of actions equal to your slowed value.",
    hasValue: true,
    decayAtEndOfTurn: false, // Decreases actions at START of turn, standard duration
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: []
  },
  "Stunned": {
    desc: "You cannot act. A stun value indicates how many total actions you lose. Each time you regain actions, reduce the number you regain by your stunned value, then reduce your stunned value by the number of actions you lost.",
    hasValue: true,
    decayAtEndOfTurn: false, // Erased as actions are prevented
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: []
  },
  "Doomed": {
    desc: "The maximum dying value at which you die is reduced by your doomed value. If your maximum dying value is reduced to 0, you instantly die.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: []
  },
  "Dying": {
    desc: "You are unconscious and bleeding out. If your dying value reaches 4, you die. If you take damage, your dying value increases by 1.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: []
  },
  "Wounded": {
    desc: "If you gain the dying condition while wounded, increase the dying condition's value by your wounded value. If you lose the dying condition and are wounded, your wounded condition value increases by 1.",
    hasValue: true,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: []
  },

  // State Penalty Debuffs
  "Off-Guard": { 
    desc: "You are fundamentally compromised. You take a –2 circumstance penalty to AC. Some abilities work only against off-guard targets.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true, 
    isBuff: false,
    modifiers: [
      { target: "ac", type: "circumstance", valueFn: () => -2 }
    ]
  },
  "Prone": {
    desc: "You're lying on the ground. You are off-guard and take a –2 circumstance penalty to attack rolls. You must stand up before you can move.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
      { target: "attack_rolls", type: "circumstance", valueFn: () => -2 },
      { target: "ac", type: "circumstance", valueFn: () => -2 } // Implies off-guard
    ]
  },
  "Fatigued": {
    desc: "You are tired. You take a –1 status penalty to AC and saving throws. You can't use exploration activities performed while traveling.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: [
      { target: "ac", type: "status", valueFn: () => -1 },
      { target: "all_dcs", type: "status", valueFn: () => -1 }
    ]
  },
  "Fascinated": {
    desc: "You are compelled to focus your attention on something. You take a –2 status penalty to Perception and skill checks, and you can't use actions with the concentrate trait unless they are related to the subject of your fascination.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
      { target: "perception", type: "status", valueFn: () => -2 },
      { target: "skill_checks", type: "status", valueFn: () => -2 }
    ]
  },
  "Blinded": {
    desc: "You can't see. All normal terrain is difficult terrain to you. You can't detect anything using vision. You take a –4 status penalty to Perception checks that require you to see.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: [
      { target: "perception", type: "status", valueFn: () => -4 }
    ]
  },
  "Deafened": {
    desc: "You can't hear. You take a –2 status penalty to Perception checks for initiative and checks that involve sound but also rely on other senses.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: [
      { target: "perception", type: "status", valueFn: () => -2 }
    ]
  },
  "Dazzled": {
    desc: "Your eyes are overwhelmed. If vision is your only precise sense, all creatures and objects are concealed from you.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: []
  },
  "Unconscious": {
    desc: "You're asleep or knocked out. You can't act. You take a –4 status penalty to AC, Perception, and Reflex saves, and you have the blinded and off-guard conditions.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: false,
    isBuff: false,
    modifiers: [
      { target: "ac", type: "status", valueFn: () => -4 },
      { target: "reflex", type: "status", valueFn: () => -4 },
      { target: "perception", type: "status", valueFn: () => -4 }
    ]
  },
  "Grabbed": {
    desc: "You're held in place by another creature or effect. You are off-guard and immobilized. To use a manipulate action, you must succeed at a DC 5 flat check or it's lost.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
        { target: "ac", type: "circumstance", valueFn: () => -2 } // Implies off-guard
    ]
  },
  "Restrained": {
    desc: "You are tied up or otherwise firmly restricted. You have the off-guard and immobilized conditions, and you can't use any actions with the attack or manipulate traits except to attempt to Escape or Force Open your bonds.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
        { target: "ac", type: "circumstance", valueFn: () => -2 } // Implies off-guard
    ]
  },
  "Paralyzed": {
    desc: "Your body is frozen in place. You have the off-guard condition and can't act, though you can use actions that require only your mind.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
        { target: "ac", type: "circumstance", valueFn: () => -2 } // Implies off-guard
    ]
  },
  "Fleeing": {
    desc: "You're forced to run away due to fear or some other compulsion. On your turn, you must spend each of your actions trying to escape the source of the fleeing condition as expediently as possible.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: []
  },
  "Confused": {
    desc: "You don't have your wits about you, and you attack mindlessly. You are off-guard, you don't treat anyone as your ally, and you can't Delay, Ready, or use reactions.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: false,
    modifiers: [
        { target: "ac", type: "circumstance", valueFn: () => -2 } // Used to imply off-guard / unpredictable
    ]
  },

  // BUFFS & Informative Tags
  "Quickened": {
    desc: "You gain 1 additional action at the start of your turn each round. Many quickened effects restrict the types of actions you can use with this extra action.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: true,
    modifiers: []
  },
  "Concealed": {
    desc: "While you are concealed from a creature, such as in thick fog, you are tough to target. A creature targeting you with an attack, spell, or other effect must succeed at a DC 5 flat check or it fails.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: true,
    modifiers: []
  },
  "Hidden": {
    desc: "While you're hidden from a creature, that creature knows the space you're in but can't tell precisely where you are. A creature targeting you with an attack, spell, or other effect must succeed at a DC 11 flat check or it fails.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: true,
    modifiers: [
      { target: "ac", type: "circumstance", valueFn: () => 2 } // Very loose approximation of flat check defensive value
    ]
  },
  "Invisible": {
    desc: "While invisible, you can't be seen. You are undetected to everyone. Creatures can seek to attempt to find you, making you merely hidden from them instead of undetected.",
    hasValue: false,
    decayAtEndOfTurn: false,
    clearOnEncounterEnd: true,
    isBuff: true,
    modifiers: []
  }
};
