import { JSDOM } from 'jsdom';
import { Heading } from '../model/model';
import { jumpToMenu } from './jump-menu';

const emptyHeadings: Heading[] = [];

const articleFragmentWithHeadings: Heading[] = [
  { id: 's1', text: 'heading 1' },
  { id: 's2', text: 'heading 2' },
  { id: 's3', text: 'heading 3' },
];

describe('jump-menu', () => {
  it('returns empty string if no headings', () => {
    const result = JSDOM.fragment(jumpToMenu(emptyHeadings));

    expect(result.querySelector('.jump-menu-container')).toBeNull();
  });

  it('returns a list of headings', () => {
    const result = JSDOM.fragment(jumpToMenu(articleFragmentWithHeadings));

    const headingsNode = result.querySelectorAll('.jump-menu-list__item > .jump-menu-list__link');
    const headings = Array.from(headingsNode)
      .map((element) => element.textContent)
      .filter((heading) => heading !== null);

    expect(headings).toStrictEqual(expect.arrayContaining(['heading 1', 'heading 2', 'heading 3']));
  });
});
