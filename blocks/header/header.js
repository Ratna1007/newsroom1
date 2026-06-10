import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeAllDropdowns(navMenu, except) {
  navMenu.querySelectorAll('.has-child[aria-expanded="true"]').forEach((li) => {
    if (li !== except) li.setAttribute('aria-expanded', 'false');
  });
}

function toggleMobileMenu(nav, forceClose) {
  const expanded = forceClose === true ? false : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Three source sections: [0] utility (logo + contact), [1] site title, [2] menu list
  const classes = ['nav-utility', 'nav-title', 'nav-menu'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(c);
  });

  const utility = nav.querySelector('.nav-utility');
  const title = nav.querySelector('.nav-title');
  const menu = nav.querySelector('.nav-menu');

  // Utility bar: first paragraph is the logo, the rest are contact links
  if (utility) {
    const paras = [...utility.querySelectorAll('p')];
    if (paras[0]) paras[0].classList.add('nav-logo');
    const contact = document.createElement('div');
    contact.className = 'nav-contact';
    paras.slice(1).forEach((p) => contact.append(p));
    utility.append(contact);
  }

  // Menu: mark items with a nested <ul> as dropdown parents
  let menuList;
  if (menu) {
    menuList = menu.querySelector('ul');
    if (menuList) {
      menuList.classList.add('nav-menu-list');
      menuList.querySelectorAll(':scope > li').forEach((li) => {
        if (li.querySelector(':scope > ul')) {
          li.classList.add('has-child');
          li.setAttribute('aria-expanded', 'false');
          const link = li.querySelector(':scope > a');
          const toggle = document.createElement('button');
          toggle.className = 'nav-arrow';
          toggle.setAttribute('type', 'button');
          toggle.setAttribute('aria-label', `Toggle ${link ? link.textContent.trim() : ''} submenu`);
          link.insertAdjacentElement('afterend', toggle);

          // Desktop: hover opens; Mobile: arrow click toggles
          li.addEventListener('mouseenter', () => {
            if (isDesktop.matches) li.setAttribute('aria-expanded', 'true');
          });
          li.addEventListener('mouseleave', () => {
            if (isDesktop.matches) li.setAttribute('aria-expanded', 'false');
          });
          toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const open = li.getAttribute('aria-expanded') === 'true';
            closeAllDropdowns(menuList, li);
            li.setAttribute('aria-expanded', open ? 'false' : 'true');
          });
        }
      });
    }
  }

  // Search form (built in JS — not part of the plain fragment)
  const search = document.createElement('div');
  search.className = 'nav-search';
  search.innerHTML = `<form role="search" action="/search">
      <input type="text" name="q" aria-label="Search">
      <button type="submit" aria-label="Search"><img src="/content/images/icon-search.svg" alt="Search"></button>
    </form>`;

  // Hamburger toggle for mobile
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('type', 'button');
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hamburger.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    toggleMobileMenu(nav);
    hamburger.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  });

  // Assemble the primary bar: hamburger + title + menu + search
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  if (hamburger) bar.append(hamburger);
  if (title) bar.append(title);
  if (menu) bar.append(menu);
  bar.append(search);
  nav.append(bar);

  // Close mobile menu / reset when crossing to desktop
  isDesktop.addEventListener('change', () => {
    toggleMobileMenu(nav, true);
    hamburger.setAttribute('aria-label', 'Open navigation');
    if (menuList) closeAllDropdowns(menuList);
  });

  // Close desktop dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (menuList && isDesktop.matches && !nav.contains(e.target)) closeAllDropdowns(menuList);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
