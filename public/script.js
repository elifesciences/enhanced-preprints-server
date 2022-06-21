/* eslint-disable no-undef */

const articleHeadings = document.querySelectorAll('h2[data-itemtype="http://schema.stenci.la/Heading"], h2[itemtype="http://schema.stenci.la/Heading"]');

let throttleTimer;

const throttle = (callback, time) => {
  if (throttleTimer) return;
  throttleTimer = true;
  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

function navHighlighter() {
  const scrollY = window.pageYOffset;

  for (let i = 0; i < articleHeadings.length; i += 1) {
    const current = articleHeadings[i];
    const next = articleHeadings[i + 1];
    const sectionTop = current.offsetTop - 50;
    const sectionId = current.getAttribute('id');

    if (
      scrollY > sectionTop
        && (next === undefined || scrollY <= next.offsetTop - 50)
    ) {
      document.querySelector(`.toc-list__link[href*=${sectionId}]`)?.parentElement.classList.add('toc-list__item--selected');
    } else {
      document.querySelector(`.toc-list__link[href*=${sectionId}]`)?.parentElement.classList.remove('toc-list__item--selected');
    }
  }
}

window.addEventListener('scroll', () => throttle(navHighlighter, 250));
