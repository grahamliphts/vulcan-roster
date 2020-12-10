import { JsonFetch, getToken } from './creds.js'

getToken(buildGuild).then(renderGuild)

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

const NATHRIA_BOSS = [
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

const NATHRIA_BOSS_SLUGS = NATHRIA_BOSS.map(boss => boss.toLowerCase().replaceAll(' ', '-').replaceAll('\'', ''))

async function buildGuild(token) {
  // step 1 : fetch members
  const PLAYERS_ROSTER_1 = [
    'celuryl', 
    'vanii', 
    'chandarax', 
    'harnoêl',
    'pateàcrepe',
    'valyriä',
    'grigadc',
    'azouki',
    'anawelle',
    'lalia',
    'konian',
    'soupeline',
    'skëmp',
    'fripougnette',
  ]
  const PLAYERS_ROSTER_2 = [
    'elzegan', 
    'maxidoo',
    'rogalhorn',
    'athénaís',
    'nydile',
    'skylorgs',
    'zylïsse',
    'shiï',
    'shadomasou',
    'sarrg',
    'shendry',
    'høkanashir',
    'omä',
    'universis',
    'sahyaa',
  ]
  return {
    rosters: [
      await buildRoster(PLAYERS_ROSTER_1, token),
      await buildRoster(PLAYERS_ROSTER_2, token)
    ],
    progress: await buildGuildProgress(NATHRIA_BOSS_SLUGS)
  }
}

async function buildRoster(players, token) {
  return await Promise.all(players.map(async (player) => (await buildPlayer(player, token))))
}

async function buildGuildProgress(bossSlugs) {
  return {
    normal: await buildGuildProgressMode(bossSlugs, 'normal'),
    heroic: await buildGuildProgressMode(bossSlugs, 'heroic'),
    mythic: await buildGuildProgressMode(bossSlugs, 'mythic'),
  }
}

async function buildGuildProgressMode(bossSlugs, mode) {
  const urls = bossSlugs.map(slug => `https://raider.io/api/v1/guilds/boss-kill?region=eu&realm=hyjal&guild=vulcan&raid=castle-nathria&boss=${slug}&difficulty=${mode}`)
  return await Promise.all(urls.map(async (url) => (await callApi(url, (data) => {
    return data.kill?.defeatedAt || null
  }))))
}

async function buildPlayer(player, token) {
  return {
    name: player,
    class: null,
    renders: await getAvatar(player, token),
    equipment: await buildEquipment(player, token),
    jobs: await buildJobs(player, token),
    raidProgress: await buildRaidProgress(player, token),
  }
}

async function getAvatar(player, token) {
  const url = `https://eu.api.blizzard.com/profile/wow/character/hyjal/${player}/character-media?namespace=profile-eu&locale=en_US&access_token=${token}`

  return await callApi(url, ({ assets }) => {

    return {
      avatar: assets[0].value,
      main: assets[2].value,
      mainRaw: assets[3].value,
    }
  })
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
        playerEnchantments[slot.type] = "No enchant"

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

function renderGuild({ rosters, progress }) {
  renderRoster(rosters[0], document.getElementById('roster_1_player_container'))
  renderRoster(rosters[1], document.getElementById('roster_2_player_container'))
  renderRaidProgress(progress, document.getElementById('slider3'))
}

function renderRaidProgress({ normal, heroic, mythic }, parent) {
  console.log(parent)
  const progressNodes = parent.getElementsByTagName('li')
  renderRaidProgressMode(progressNodes[0], normal)
  renderRaidProgressMode(progressNodes[1], heroic)
  renderRaidProgressMode(progressNodes[2], mythic)
}

function renderRaidProgressMode(parent, dates) {
  [].slice.call(parent.getElementsByTagName('h5')).forEach((node, index) => {
    if (dates[index]) {
      node.innerHTML = `${NATHRIA_BOSS[index]} (${formatDate(dates[index])})`
    } else {
      node.innerHTML = `${NATHRIA_BOSS[index]}`
    }
    node.className += dates[index] ? 'no-slack' : ''
  })
}

function renderRoster(players, parent) {
  let playerColElements = [
    createPlayerColElement(),
    createPlayerColElement(),
    createPlayerColElement()
  ]

  players.forEach((player, index) => {
    playerColElements[index%3].appendChild(createPlayerElement(player))
  })

  playerColElements.forEach(colElement => {
    parent.appendChild(colElement)
  })

  parent.innerHTML += '<div class="clearfix"> </div>'

  const tags = [].slice.call(parent.getElementsByTagName('h5'))
  players.forEach((player) => {
    tags
      .find(({ innerText }) => innerText.toLowerCase() === player.name)
      .addEventListener('click', handleClickOnPlayer.bind(player))
  })
}

function createPlayerColElement() {
  const div = document.createElement('div')
  div.className += "col-md-4 services-grid"

  return div
}

function createPlayerElement({ name, equipment, renders }) {

  const div = document.createElement('div')
  div.className += 'services-grid1'

  div.innerHTML = `
      <div class="col-md-4 services-grid-right">
        <div class="services-grid-right-grid hvr-radial-out">
          <span>
            <img src="${renders.avatar}" />
          </span>
        </div>
      </div>
      <div class="col-md-8 services-grid-left services-grid-left1">
        <h5><a href="#" data-toggle="modal" data-target="#playerModal">${name}</a></h5>
        <p>${equipment.ilvl}</p>
        <p>${equipment.slackScore}</p>
      </div>
      <div class="clearfix"> </div>
  `
  return div
}

function handleClickOnPlayer() {
  const { name, renders, raidProgress, equipment, jobs } = this

  document.getElementById('modal-title').innerText = capitalize(name)
  document.getElementById('modal-avatar').src = renders.mainRaw
  document.getElementById('modal-enchantments').innerHTML = printEnchantments(equipment.enchantments)
  document.getElementById('modal-jobs').innerHTML = printJobs(jobs)
  document.getElementById('modal-raid-progress').innerHTML = printRaidProgress(raidProgress)
}

function printEnchantments(enchantments) {
  return ENCHANTABLE_SLOTS.map(slot => {
    return enchantments[slot] ? `<div>
      <span><strong>${capitalize(slot.toLowerCase().replace('_', ' '))}</strong></span>
      <span class="${enchantments[slot] === "No enchant" ? 'slack' : 'no-slack'}">${enchantments[slot]}</span>
    </div>` : ''
  }).join('')
}

function printJobs({ main, secondary }) {
  let res = ''

  res += main ? printJob(main) : ''
  res += secondary ? printJob(secondary) : ''

  return res
}

function printJob({ name, skillPoints, maxSkillPoints }) {
  return `<div>
      <span><strong>${name}</strong></span>
      <span>${skillPoints} / ${maxSkillPoints}</span>
    </div>`
}

function printRaidProgress({ totalBosses, normalProgress, heroicProgress, mythicProgress }) {
  return `
    <div>
      <span><strong>Normal</strong></span>
      <span>${normalProgress} / ${totalBosses}</span>
    </div>
    <div>
      <span><strong>Heroic</strong></span>
      <span>${heroicProgress} / ${totalBosses}</span>
    </div>
    <div>
      <span><strong>Mythic</strong></span>
      <span>${mythicProgress} / ${totalBosses}</span>
    </div>
    `
}


function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' }

  return (new Date(date)).toLocaleDateString('fr-FR', options)
}
