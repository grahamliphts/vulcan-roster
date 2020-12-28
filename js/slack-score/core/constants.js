import { slug } from './string.js'

export const CURRENT_PROGRESS_BOSS = [
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

export const CURRENT_PROGRESS_BOSS_SLUGS = CURRENT_PROGRESS_BOSS.map(boss => slug(boss))

export const CURRENT_DUNGEONS = [
  'De Other Side',
  'Halls of Atonement',
  'Mists of Tirna Scithe',
  'Plaguefall',
  'Sanguine Depths',
  'Spires of Ascension',
  'The Necrotic Wake',
  'Theater of Pain',
]

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
