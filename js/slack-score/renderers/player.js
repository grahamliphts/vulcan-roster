import { ILVL_THRESHOLD, SLACK_SCORE_THRESHOLD } from '../config.js'
import { capitalize, slug } from '../core/string.js'
import { ENCHANTABLE_SLOTS } from '../core/constants.js'

export const createPlayerElement = ({ name, role, equipment, renders, profile }) => {
  const { class: playerClass, title } = profile
  const { avatar } = renders
  const { ilvl, slackScore } = equipment
  const ilvlClass = ilvl < ILVL_THRESHOLD ? 'slack-ilvl' : ''
  const slackScoreClass = slackScore > SLACK_SCORE_THRESHOLD ? 'slack-enchant' : 'no-slack-enchant'

  const div = document.createElement('div')
  div.className += 'services-grid1'
  div.innerHTML = `
      <div class="col-md-4 services-grid-right">
        <div class="services-grid-right-grid hvr-radial-out">
          <span>
          <a href="#" data-toggle="modal" data-target="#playerModal">
            <img src="${avatar}" name='${name}'/>
            </a>
          </span>
        </div>
      </div>
      <div class="col-md-8 services-grid-left services-grid-left1">
        <h5><a href="#" data-toggle="modal" data-target="#playerModal">${title}</a></h5>
         <p>
           <span class="text-uppercase ${slug(playerClass)}">${playerClass}</span> | 
           <span style="text-transform: uppercase">${role}</span> | 
           <span class="${ilvlClass}">${ilvl}</span> | 
           <span class="${slackScoreClass}">${slackScore}</span>
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
  ENCHANTABLE_SLOTS.map(slot => {
    if (enchantments[slot] === undefined)
      return ''

    const unslugSlot = slot.toLowerCase().replace('_', '')
    const enchantClass = enchantments[slot] === 'No enchant' ? 'slack-enchant' : 'no-slack-enchant'
    return `
      <div>
        <span class="modal-subsection-title">${unslugSlot}</span>
        <span class="${enchantClass}">${enchantments[slot]}</span>
      </div>
      `
  }
  ).join('')

const printJobs = ({ main, secondary }) =>
  `${main ? printJob(main) : ''}
   ${secondary ? printJob(secondary) : ''}
  `

const printJob = ({ name, skillPoints, maxSkillPoints }) =>
  `
    <div>
      <span class="modal-subsection-title">${name}</span>
      <span>${skillPoints} / ${maxSkillPoints}</span>
    </div>
  `

const printRaidProgress = ({ totalBosses, normalProgress, heroicProgress, mythicProgress }) =>
  `
    <div>
      <span class="modal-subsection-title">Normal</span>
      <span>${normalProgress} / ${totalBosses}</span>
    </div>
    <div>
      <span class="modal-subsection-title">Heroic</span>
      <span>${heroicProgress} / ${totalBosses}</span>
    </div>
    <div>
      <span class="modal-subsection-title">Mythic</span>
      <span>${mythicProgress} / ${totalBosses}</span>
    </div>
  `
