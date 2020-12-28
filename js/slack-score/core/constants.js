import { slug } from './string.js'

export const NATHRIA_BOSS = [
  'Shriekwing',
  'Huntsman Altimor',
  'Hungering Destroyer',
  'Sun King\'s Salvation',
  'Artificer Xy\'mox',
  'Lady Inerva Darkvein',
  'The Council of Blood',
  'Sludgefist',
  'Stone Legion Generals',
  'Sire Denathrius'
]

export const NATHRIA_BOSS_SLUGS = NATHRIA_BOSS.map(boss => slug(boss))

export const CLASS = {
  'death-knight': { color: '#C41E3A', icon: null },
  'demon-hunter': { color: '#A330C9', icon: null },
  'druid': { color: '#FF7C0A', icon: null },
  'hunter': { color: '#AAD372', icon: null },
  'mage': { color: '#3FC7EB', icon: null },
  'monk': { color: '#00FF98', icon: null },
  'paladin': { color: '#F48CBA', icon: null },
  'priest': { color: '#CCCCCC', icon: null },
  'rogue': { color: '#FFF468', icon: null },
  'shaman': { color: '#0070DD', icon: null },
  'warlock': { color: '#8788EE', icon: null },
  'warrior': { color: '#C69B6D', icon: null },
}

export const ENCHANTABLE_SLOTS = [
  'BACK',
  'CHEST',
  'WRIST',
  'FEET',
  'HANDS',
  'MAIN_HAND',
  'OFF_HAND',
  'FINGER_1',
  'FINGER_2',
]
