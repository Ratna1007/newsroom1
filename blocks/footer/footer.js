import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Three source bands: [0] about statement, [1] social/copyright, [2] acknowledgement
  const bandClasses = ['footer-about', 'footer-social', 'footer-acknowledgement'];
  bandClasses.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(c);
  });

  // Social band: split the copyright/links row from the social-icon list
  const social = footer.querySelector('.footer-social');
  if (social) {
    const list = social.querySelector('ul');
    if (list) list.classList.add('footer-social-list');
    const copy = social.querySelector('p');
    if (copy) copy.classList.add('footer-copyright');
  }

  block.append(footer);
}
