type Heading = { id: string, text: string };

export const jumpToMenu = (headings: Heading[]): string => (headings.length ? `
    <nav class="jump-menu-container">
      <ul class="jump-menu-list">
      <li class="jump-menu-list__item"><a class="jump-menu-list__link" href="#evaluation-summary">eLife review summary</a></li>
        ${headings.map((heading) => `
              <li class="jump-menu-list__item"><a class="jump-menu-list__link" href="#${heading.id}">${heading.text}</a></li>
            `).join('')}
      </ul>
    </nav>
` : '');
