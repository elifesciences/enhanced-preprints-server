import { contentToHtml } from '../model/content';
import { Heading } from '../model/model';

export const jumpToMenu = (headings: Heading[]): string => (headings.length ? `
    <nav class="jump-menu-container">
      <ul class="jump-menu-list">
      <li class="jump-menu-list__item"><a class="jump-menu-list__link" href="#evaluation-summary">eLife review summary</a></li>
      <li class="jump-menu-list__item"><a class="jump-menu-list__link" href="#abstract">Abstract</a></li>
        ${headings.map((heading) => `
              <li class="jump-menu-list__item"><a class="jump-menu-list__link" href="#${heading.id}">${contentToHtml(heading.text)}</a></li>
            `).join('')}
      </ul>
    </nav>
` : '');
