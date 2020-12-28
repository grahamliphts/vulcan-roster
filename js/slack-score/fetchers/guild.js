import { callApi, getGuildRaidProgressUrl } from '../core/api.js'
import { NATHRIA_BOSS_SLUGS, ENCHANTABLE_SLOTS } from '../core/constants.js'
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
