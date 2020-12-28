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
