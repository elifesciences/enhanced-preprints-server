import { normaliseContentToHtml } from './utils';

describe('utils', () => {
  const complicatedTitle: string | (string | {
    content: string[],
    type: string,
  })[] = [
    { type: 'Emphasis', content: ['emphasised'] },
    ' normal text',
  ];

  it.each([
    [complicatedTitle, '<em>emphasised</em> normal text'],
    [JSON.stringify(complicatedTitle), '<em>emphasised</em> normal text'],
    ['This is a title', 'This is a title'],
  ])('process %o to equal "%s"', (input, expected) => {
    const title = normaliseContentToHtml(input);

    expect(title).toStrictEqual(expected);
  });
});
