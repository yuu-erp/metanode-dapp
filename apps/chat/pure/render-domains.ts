import { DOMAINS } from './domains'

export function renderDomainNav() {
  const nav = document.getElementById('domain-nav')
  if (!nav) return

  const fragment = document.createDocumentFragment()
  for (const domain of DOMAINS) {
    const link = document.createElement('a')
    link.className = 'domain-nav-link'
    link.href = `#domain-${String(domain.id).padStart(2, '0')}`
    link.textContent = `${domain.id}. ${domain.title}`
    fragment.appendChild(link)
  }
  nav.replaceChildren(fragment)
}

export function renderDomainPanels() {
  const root = document.getElementById('domains')
  if (!root) return

  const fragment = document.createDocumentFragment()
  for (const domain of DOMAINS) {
    const section = document.createElement('section')
    section.className = 'domain-panel'
    section.id = `domain-${String(domain.id).padStart(2, '0')}`
    section.setAttribute('data-domain-id', String(domain.id))

    const heading = document.createElement('h2')
    heading.className = 'domain-title'
    heading.textContent = `${domain.id}. ${domain.title}`

    const desc = document.createElement('p')
    desc.className = 'domain-desc'
    desc.textContent = domain.description

    const body = document.createElement('div')
    body.className = 'domain-body'
    body.setAttribute('data-domain-body', String(domain.id))

    section.append(heading, desc, body)
    fragment.appendChild(section)
  }
  root.replaceChildren(fragment)
}
