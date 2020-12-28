import { createPlayerElement, handleClickOnPlayer } from './player.js'
import { formatDate } from '../core/date.js'
import { CURRENT_PROGRESS_BOSS } from '../core/constants.js'

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
      node.innerHTML = `${CURRENT_PROGRESS_BOSS[index]} (${formatDate(dates[index])})`
    } else {
      node.innerHTML = `${CURRENT_PROGRESS_BOSS[index]}`
    }
    node.className += dates[index] ? 'boss-down' : ''
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
