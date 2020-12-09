import { JsonFetch, getToken } from './creds.js'

getToken(buildGuild).then(console.log)

const ENCHANTABLE_SLOTS = [
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

async function buildGuild(token) {
  // step 1 : fetch members
  const PLAYERS_ROSTER_1 = ['celuryl', 'vanii']
  const PLAYERS_ROSTER_2 = ['elzegan', 'maxidoo']

  return {
    rosters: [
      await buildRoster(PLAYERS_ROSTER_1, token),
      await buildRoster(PLAYERS_ROSTER_2, token)
    ]
  }
}

async function buildRoster(players, token) {
  return await Promise.all(players.map(async (player) => (await buildPlayer(player, token))))
}

async function buildPlayer(player, token) {
  return {
    name: player,
    class: null,
    equipment: await buildEquipment(player, token),
    jobs: await buildJobs(player, token),
    raidProgress: await buildRaidProgress(player, token),
  }
}

async function buildEquipment(player, token) {
  const url = `https://eu.api.blizzard.com/profile/wow/character/hyjal/${player}/equipment?namespace=profile-eu&locale=en_US&access_token=${token}`

  const {
    ilvlSum,
    ilvlDivider,
    slackScore,
    playerEnchantments
  } = await callApi(url, (({ equipped_items }) =>
    equipped_items.reduce(({ ilvlSum, ilvlDivider, slackScore, playerEnchantments }, item) => {
      const { level, slot } = item

      // ignore low level items
      if (level.value < 50) {
        return { ilvlSum, ilvlDivider, slackScore, playerEnchantments }
      }

      // handle enchantable item
      if (ENCHANTABLE_SLOTS.includes(slot.type)) {
        slackScore++
        playerEnchantments[slot.type] = "Pas d'enchantement"

        if (item.enchantments) {
          slackScore--
          playerEnchantments[slot.type] = item.enchantments[0].display_string.replace('Enchanted: ', '')
        }
      }

      return {
        ilvlSum: ilvlSum + level.value,
        ilvlDivider: ilvlDivider + 1,
        slackScore,
        playerEnchantments
      }
    }, { ilvlSum: 0, ilvlDivider: 0, slackScore: 0, playerEnchantments: {} })
  ))

  return {
    ilvl: parseFloat((ilvlSum / ilvlDivider).toFixed(2)),
    enchantments: playerEnchantments,
    slackScore,
  }
}

async function buildJobs(player, token) {
  const url = `https://eu.api.blizzard.com/profile/wow/character/hyjal/${player}/professions?namespace=profile-eu&locale=en_EU&access_token=${token}`;

  return await callApi(url, data => {
    return {
      main: (data.primaries?.length >= 1) ? buildJob(data.primaries[0]) : null,
      secondary: (data.primaries?.length >= 2) ? buildJob(data.primaries[1]) : null,
    }
  })
}

function buildJob(primary) {
  const { tiers } = primary
  const { skill_points, max_skill_points, tier } = tiers[tiers.length - 1]

  return {
    name: tier.name,
    skillPoints: skill_points,
    maxSkillPoints: max_skill_points
  }
}

async function buildRaidProgress(player) {
  const url = `https://raider.io/api/v1/characters/profile?region=eu&realm=hyjal&name=${player}&fields=raid_progression`;

  return await callApi(url, ({ raid_progression }) => {
    const { total_bosses, normal_bosses_killed, heroic_bosses_killed, mythic_bosses_killed } = raid_progression['castle-nathria']
    return { 
      totalBosses: total_bosses, 
      normalProgress: normal_bosses_killed,
      heroicProgress: heroic_bosses_killed, 
      mythicProgress: mythic_bosses_killed
    }
  })
}

async function callApi(url, callback) {
  const data = (await JsonFetch(url))
  return callback(data)
}
