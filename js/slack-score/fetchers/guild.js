import { callApi, getGuildRaidProgressUrl } from '../core/api.js'
import { NATHRIA_BOSS_SLUGS, CLASS, ENCHANTABLE_SLOTS } from '../core/constants.js'
import { PLAYERS_ROSTER_1, PLAYERS_ROSTER_2 } from '../config.js'

import { buildPlayer } from './player.js'

export const buildGuild = async (token) => ({
  rosters: [
    await buildRoster(PLAYERS_ROSTER_1, token),
    await buildRoster(PLAYERS_ROSTER_2, token)
  ],
  progress: await buildGuildProgress(NATHRIA_BOSS_SLUGS)
})

const buildRoster = async (players, token) =>
  await Promise.all(players.map(async (player) => (await buildPlayer(player, token))))

const buildGuildProgress = async (bossSlugs) => ({
  normal: await buildGuildProgressMode(bossSlugs, 'normal'),
  heroic: await buildGuildProgressMode(bossSlugs, 'heroic'),
  mythic: await buildGuildProgressMode(bossSlugs, 'mythic'),
})

const buildGuildProgressMode = async (bossSlugs, mode) =>  {
  const urls = bossSlugs.map(slug => `https://raider.io/api/v1/guilds/boss-kill?region=eu&realm=hyjal&guild=vulcan&raid=castle-nathria&boss=${slug}&difficulty=${mode}`)
  return await Promise.all(urls.map(async (url) => (await callApi(url, (data) => {
    return data.kill?.defeatedAt || null
  }))))
}

export const renderGuild = ({ rosters, progress }) => {
  document.getElementById('progress').className += 'hidden'
  document.getElementById('roster_1').classList.remove('vulcan-hidden')
  document.getElementById('roster_2').classList.remove('vulcan-hidden')
  document.getElementById('raid-progress').classList.remove('vulcan-hidden')
  renderRoster(rosters[0], document.getElementById('roster_1_player_container'))
  renderRoster(rosters[1], document.getElementById('roster_2_player_container'))
  renderRaidProgress(progress, document.getElementById('slider3'))
}

const renderRaidProgress = ({ normal, heroic, mythic }, parent) => {
  const progressNodes = parent.getElementsByTagName('li')
  renderRaidProgressMode(progressNodes[0], normal)
  renderRaidProgressMode(progressNodes[1], heroic)
  renderRaidProgressMode(progressNodes[2], mythic)
}

const renderRaidProgressMode = (parent, dates) => {
  [].slice.call(parent.getElementsByTagName('h5')).forEach((node, index) => {
    if (dates[index]) {
      node.innerHTML = `${NATHRIA_BOSS[index]} (${formatDate(dates[index])})`
    } else {
      node.innerHTML = `${NATHRIA_BOSS[index]}`
    }
    node.className += dates[index] ? 'no-slack' : ''
  })
}

const renderRoster = (players, parent) => {
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

const createPlayerColElement = () => {
  const div = document.createElement('div')
  div.className += "col-md-4 services-grid"

  return div
}

const createPlayerElement = ({ name, role, equipment, renders, profile }) => {
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

const handleClickOnPlayer = () => {
  const { name, renders, raidProgress, equipment, jobs, profile } = this

  document.getElementById('modal-title').innerText = capitalize(profile.title)
  document.getElementById('modal-avatar').src = renders.mainRaw
  document.getElementById('modal-enchantments').innerHTML = printEnchantments(equipment.enchantments)
  document.getElementById('modal-jobs').innerHTML = printJobs(jobs)
  document.getElementById('modal-raid-progress').innerHTML = printRaidProgress(raidProgress)
}

const printEnchantments = (enchantments) => 
  ENCHANTABLE_SLOTS.map(slot => 
    enchantments[slot] ? `
      <div>
        <span><strong>${capitalize(slot.toLowerCase().replace('_', ' '))}</strong></span>
        <span class="${enchantments[slot] === "No enchant" ? 'slack' : 'no-slack'}">${enchantments[slot]}</span>
      </div>
    ` : ''
  ).join('')

const printJobs = ({ main, secondary }) => {
  let res = ''

  res += main ? printJob(main) : ''
  res += secondary ? printJob(secondary) : ''

  return res
}

const printJob = ({ name, skillPoints, maxSkillPoints }) =>
  `
    <div>
      <span><strong>${name}</strong></span>
      <span>${skillPoints} / ${maxSkillPoints}</span>
    </div>
  `

const printRaidProgress = ({ totalBosses, normalProgress, heroicProgress, mythicProgress }) =>
  `
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
