import { JsonFetch, getToken } from './creds.js'

let PROGRESS_BAR = 0
let PROGRESS = 175

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

const NATHRIA_BOSS_SLUGS = NATHRIA_BOSS.map(boss => slug(boss))

const CLASS = {
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

async function buildGuild(token) {
  // step 1 : fetch members
  const PLAYERS_ROSTER_1 = [
    {name: 'celuryl', role: 'tank'}, 
    {name: 'vanii', role: 'tank'}, 
    {name: 'chandarax', role: 'heal'}, 
    {name: 'harnoêl', role: 'heal'},
    {name: 'pateàcrepe', role: 'heal'},
    {name: 'valyriä', role: 'dps'},
    {name: 'grigadc', role: 'dps'},
    {name: 'azouki', role: 'dps'},
    {name: 'anawelle', role: 'dps'},
    {name: 'lalia', role: 'dps'},
    {name: 'konian', role: 'dps'},
    {name: 'soupeline', role: 'dps'},
    {name: 'skëmp', role: 'dps'},
    {name: 'fripougnette', role: 'dps'},
  ]
  const PLAYERS_ROSTER_2 = [
    {name: 'elzegan', role: 'tank'}, 
    {name: 'rogalhorn', role: 'tank'},
    {name: 'kanech', role: 'heal'},
    {name: 'nydile', role: 'heal'},
    {name: 'skýlorg', role: 'heal'},
    {name: 'maxidoo', role: 'dps'},
    {name: 'zylïsse', role: 'dps'},
    {name: 'fiedryeva', role: 'dps'},
    {name: 'shadomasou', role: 'dps'},
    {name: 'sarrg', role: 'dps'},
    {name: 'høkanashir', role: 'dps'},
    {name: 'tyänna', role: 'dps'},
    {name: 'universis', role: 'dps'},
    {name: 'sahyaa', role: 'dps'},
  ]
  const res = {
    rosters: [
      await buildRoster(PLAYERS_ROSTER_1, token),
      await buildRoster(PLAYERS_ROSTER_2, token)
    ],
    progress: await buildGuildProgress(NATHRIA_BOSS_SLUGS)
  }

  //console.log(res)

  return res
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

async function buildPlayer({name, role}, token) {
  return {
    name,
    role,
    profile: await getProfile(name, token),
    renders: await getAvatar(name, token),
    equipment: await buildEquipment(name, token),
    jobs: await buildJobs(name, token),
    raidProgress: await buildRaidProgress(name, token),
  }
}

async function getProfile(player, token) {
  const url = `https://eu.api.blizzard.com/profile/wow/character/hyjal/${player}?namespace=profile-eu&locale=en_US&access_token=${token}`

  return await callApi(url, ({ character_class, active_title }) => {
    return {
      class: character_class.name,
      title: active_title?.display_string.replace('{name}', capitalize(player)) || capitalize(player),
    }
  })
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
  updateProgressBar()
  return callback(data)
}

function updateProgressBar() {
  PROGRESS_BAR++
  document.getElementById('progress-bar').style.width = Math.round((PROGRESS_BAR / PROGRESS) * 100) + '%'
}

function renderGuild({ rosters, progress }) {
  document.getElementById('progress').className += 'hidden'
  document.getElementById('roster_1').classList.remove('vulcan-hidden')
  document.getElementById('roster_2').classList.remove('vulcan-hidden')
  document.getElementById('raid-progress').classList.remove('vulcan-hidden')
  renderRoster(rosters[0], document.getElementById('roster_1_player_container'))
  renderRoster(rosters[1], document.getElementById('roster_2_player_container'))
  renderRaidProgress(progress, document.getElementById('slider3'))
}

function renderRaidProgress({ normal, heroic, mythic }, parent) {
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
      .find(({ innerText }) => innerText.toLowerCase().includes(player.name))
      .addEventListener('click', handleClickOnPlayer.bind(player))
  })
  const imgTags = [].slice.call(parent.getElementsByTagName('img'))
  players.forEach((player) => {
    imgTags
      .find(({ name }) => name.toLowerCase() === player.name)
      .addEventListener('click', handleClickOnPlayer.bind(player))
  })
}

function createPlayerColElement() {
  const div = document.createElement('div')
  div.className += "col-md-4 services-grid"

  return div
}

function createPlayerElement({ name, role, equipment, renders, profile }) {
  const ilvlStyle = equipment.ilvl < 170 ? 'style="color: red"' : ''
  const slackScoreColor = equipment.slackScore > 1 ? 'red' : 'darkseagreen'

  const div = document.createElement('div')
  div.className += 'services-grid1'
  div.innerHTML = `
      <div class="col-md-4 services-grid-right">
        <div class="services-grid-right-grid hvr-radial-out">
          <span>
          <a href="#" data-toggle="modal" data-target="#playerModal">
            <img src="${renders.avatar}"  name = '${name}' />
            </a>
          </span>
        </div>
      </div>
      <div class="col-md-8 services-grid-left services-grid-left1">
        <h5><a href="#" data-toggle="modal" data-target="#playerModal">${profile.title}</a></h5>
         <p>
           <span style="color: ${CLASS[slug(profile.class)].color}; text-transform: uppercase;">${profile.class}</span> | 
           <span style="text-transform: uppercase">${role}</span> | 
           <span ${ilvlStyle}>${equipment.ilvl}</span> | 
           <span style="color: ${slackScoreColor}">${equipment.slackScore}</span>
      </div>
      <div class="clearfix"> </div>
  `
  return div
}

function handleClickOnPlayer() {
  const { name, renders, raidProgress, equipment, jobs, profile } = this

  document.getElementById('modal-title').innerText = capitalize(profile.title)
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

function slug(string) {
  return string.toLowerCase().replaceAll(' ', '-').replaceAll('\'', '')
}
