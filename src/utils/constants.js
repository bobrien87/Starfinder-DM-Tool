export const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuAUESglkJuj-oaFo6pfAClJaamv5ijOb7MlRAZNp1CBVGKv2-9hzRn9tLpi27CS3O3ghq0p7Ubub-6dfka0CUC4XwSYqJ2I_vhWUpkB4jffRkxUZKv7e530UpFeV0f9uRsZOCjjM8xWvxzjZZ6jS31gNyNWib6Vt_FKV4sFV-XWWRNKi9v4wVqHbmV9mPTBhB2TFF7rN5VlsSiw2WQAfIu-d3omVy1uax55Mj3yUhJWk9wCxawj4UEOwmRFTPjIPcEwVxtS0q04aQ";

export const SIZE_TRAITS = ["tiny", "small", "medium", "large", "huge", "gargantuan"];

export const WEAPON_TRAITS = [
  "Agile", "Analog", "Archaic", "Area", "Automatic", "Block", 
  "Brutal", "Capacity", "Concealable", "Deadly", "Deflect", 
  "Disarm", "Fatal", "Finesse", "Forceful", "Free-Hands", 
  "Injection", "Nonlethal", "Parry", "Propulsive", "Reach", 
  "Reload", "Shove", "Sweep", "Tech", "Thrown", "Trip", 
  "Two-Hand", "Unarmed", "Unwieldy", "Volley"
];

export const ABILITY_TRAITS = [
  "Acid", "Arcane", "Auditory", "Aura", "Chaotic", "Cold", "Concentrate", 
  "Construct", "Darkness", "Death", "Disease", "Divine", "Electricity", 
  "Emotion", "Evil", "Fear", "Fire", "Force", "Good", "Healing", 
  "Illusion", "Incapacitation", "Lawful", "Light", "Linguistic", "Magical", 
  "Manipulate", "Mental", "Move", "Necromancy", "Occult", "Olfactory", 
  "Poison", "Polymorph", "Primal", "Sonic", "Tech", "Teleportation", 
  "Visual", "Vitality", "Void"
];

export const TRAIT_DESCRIPTIONS = {
  "Agile": "The multiple attack penalty you take with this weapon on the second attack on your turn is -4 instead of -5, and -8 instead of -10 on the third and subsequent attacks.",
  "Analog": "This equipment does not require battery power or computer systems to operate.",
  "Area": "This weapon fires in a specialized cone, line, or burst, affecting all targets within the specified template rather than targeting a single AC.",
  "Automatic": "You can expend additional ammunition to attack all creatures in a line or burst, applying the same attack roll to all of them.",
  "Block": "You can use this weapon to perform the Shield Block reaction to reduce taking physical damage.",
  "Brutal": "This ranged weapon uses your Strength modifier instead of your Dexterity modifier on attack rolls.",
  "Capacity": "This weapon holds a specific amount of ammunition and requires interacting to swap to the next loaded chamber.",
  "Concealable": "This weapon is easy to hide. You gain a +2 circumstance bonus to Stealth checks to conceal it.",
  "Deadly": "On a critical hit, the weapon adds a weapon damage die of the listed size.",
  "Deflect": "You can use this weapon to deflect projectiles or melee attacks.",
  "Disarm": "You can use this weapon to Disarm with the Athletics skill even if you don't have a free hand.",
  "Fatal": "On a critical hit, the weapon's damage die size increases to the listed size, and you add one additional die of that size.",
  "Finesse": "You can use your Dexterity modifier instead of your Strength modifier on attack rolls using this melee weapon.",
  "Forceful": "When you attack with this weapon more than once on your turn, the second attack gains a circumstance bonus to damage equal to the number of weapon damage dice.",
  "Free-Hands": "As long as you meet the hand requirements, you still count as having a free hand to hold other items or perform interactions.",
  "Injection": "This weapon can be loaded with medicines, poisons, or serums which are delivered to the target on a successful hit.",
  "Nonlethal": "Attacks made with this weapon are nonlethal. Using it to make a lethal attack imposes a -2 circumstance penalty.",
  "Parry": "This weapon can be used to fend off attacks. You can spend a single action to gain a +1 circumstance bonus to AC until your next turn.",
  "Propulsive": "You add half your Strength modifier (if positive) to damage rolls with this ranged weapon.",
  "Reach": "This weapon is long and can be used to attack creatures up to the listed distance away.",
  "Reload": "The weapon requires the listed number of Interact actions to insert new ammunition before it can be fired again.",
  "Shove": "You can use this weapon to Shove with the Athletics skill even if you don't have a free hand.",
  "Sweep": "You gain a +1 circumstance bonus to your attack roll if you already attempted to attack a different target this turn using this weapon.",
  "Tech": "This item is powered by technology and relies on batteries or mechanical infrastructure.",
  "Thrown": "You can throw this weapon as a ranged attack.",
  "Trip": "You can use this weapon to Trip with the Athletics skill even if you don't have a free hand.",
  "Two-Hand": "This weapon can be wielded with two hands. Doing so changes its weapon damage die to the listed value.",
  "Unarmed": "An unarmed attack uses your body rather than a manufactured weapon.",
  "Unwieldy": "You cannot attack with this weapon more than once per turn.",
  "Volley": "This ranged weapon is less effective at close distances. You take a -2 penalty to attack rolls against targets within the listed volley range.",
  "Arcane": "This magic comes from the logical study of the arcane tradition.",
  "Divine": "This magic comes from the divine tradition, granted by faith or deities.",
  "Occult": "This magic comes from the occult tradition, focusing on the bizarre and ephemeral.",
  "Primal": "This magic comes from the primal tradition, tied to nature and instinct.",
  "Concentrate": "This action requires a degree of mental concentration and discipline.",
  "Manipulate": "You must physically manipulate an item or make gestures to use this action.",
  "Magical": "This effect is magical and functions as a supernatural deviation from physics.",
  "Expend": "This action expends ammunition or charges from a battery or item.",
  "Mindless": "A mindless creature has either programmed or rudimentary mental faculties, making them immune to mental effects.",
  "Undead": "Once living, these creatures are animated by void energy and are damaged by vitality energy.",
  "Zombie": "A type of undead creature typically animated from a corpse and notoriously slow unless stimulated by magic.",
  "Swarm": "A swarm is a mass of creatures that function as a single monster, often resistant to physical attacks but vulnerable to area effects.",
  "Construct": "A construct is an artificial creature usually powered by magic, clockwork, or advanced technology.",
  "Elemental": "A creature composed primarily of elemental matter rather than flesh and blood.",
  "Incorporeal": "An incorporeal creature has no physical body, making it immune to precision damage and highly resistant to physical attacks.",
  "Amphibious": "An amphibious creature can breathe both air and water indefinitely."
};

export const GAME_SKILLS = [
  "Acrobatics", "Arcana", "Athletics", "Computers", "Crafting", 
  "Deception", "Diplomacy", "Intimidation", "Medicine", "Nature", 
  "Occultism", "Performance", "Piloting", "Religion", "Society", 
  "Stealth", "Survival", "Thievery"
];

export const RARITY_COLORS = {
  common: 'bg-surface-container-highest border-outline-variant/30 text-secondary',
  uncommon: 'bg-green-500/20 border-green-500/40 text-green-400',
  rare: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  unique: 'bg-purple-500/20 border-purple-500/40 text-purple-400'
};

export const PROFICIENCY_COLORS = {
  0: 'bg-surface-container-highest border-outline-variant/30 text-secondary',
  1: 'bg-green-500/20 border-green-500/40 text-green-400',
  2: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  3: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  4: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
};

export const SPELL_TRADITIONS = [
  "Arcane", "Divine", "Occult", "Primal"
];
