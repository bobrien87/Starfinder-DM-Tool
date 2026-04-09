export const DAMAGE_TYPES = [
    "Acid", "Bludgeoning", "Cold", "Electricity", 
    "Fire", "Force", "Piercing", "Radiation", 
    "Slashing", "Sonic", "Vitality", "Void"
];

export const SPECIAL_DEFENSES = [
    "Area Damage", "Critical Hits", "Death Effects", 
    "Disease", "Emotion", "Fear", "Holy", "Magic",
    "Mental", "Nonlethal Attacks", "Poison", 
    "Precision", "Sneak Attack", "Spirit", 
    "Splash Damage", "Unholy", "Water"
];

export const ALL_CONDITIONS = [
    "Bleed", "Blinded", "Confused", "Controlled", 
    "Dazzled", "Deafened", "Doomed", "Drained", 
    "Dying", "Encumbered", "Enervated", "Fascinated", 
    "Fatigued", "Fleeing", "Frightened", "Glitching", 
    "Grabbed", "Hidden", "Immobilized", "Off-Guard", 
    "Paralyzed", "Petrified", "Prone", "Quickened", 
    "Restrained", "Sickened", "Slowed", "Stunned", 
    "Stupefied", "Suppressed", "Unconscious"
];

export const IMMUNITY_OPTIONS = [
    ...DAMAGE_TYPES,
    ...SPECIAL_DEFENSES,
    ...ALL_CONDITIONS
].sort();

export const RESISTANCE_WEAKNESS_OPTIONS = [
    ...DAMAGE_TYPES,
    "All Damage", "Physical", "Energy", "Alignment", 
    ...SPECIAL_DEFENSES,
    ...ALL_CONDITIONS
].sort();
