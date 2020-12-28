import { ILVL_THRESHOLD, SLACK_SCORE_THRESHOLD } from '../config.js'
import { capitalize, slug } from '../core/string.js'
import { CLASS, ENCHANTABLE_SLOTS } from '../core/constants.js'

export const createPlayerElement = ({ name, role, equipment, renders, profile }) => {
  const ilvlStyle = equipment.ilvl < ILVL_THRESHOLD ? 'style="color: red"' : ''
  const slackScoreColor = equipment.slackScore > SLACK_SCORE_THRESHOLD ? 'red' : 'darkseagreen'

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

// do not use ES6 syntax as it does not allow .bind()
export function handleClickOnPlayer() {
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
        <span class="${enchantments[slot] === 'No enchant' ? 'slack' : 'no-slack'}">${enchantments[slot]}</span>
      </div>
    ` : ''
  ).join('')

const printJobs = ({ main, secondary }) =>
  `${main ? printJob(main) : ''}
   ${secondary ? printJob(secondary) : ''}
  `

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
