export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  // Style a standalone CTA link (a paragraph whose only content is one link) as a button
  block.querySelectorAll('p a[href]').forEach((a) => {
    const p = a.closest('p');
    if (p && p.textContent.trim() === a.textContent.trim() && !a.querySelector('img')) {
      p.classList.add('button-wrapper');
      a.classList.add('button');
    }
  });
}
