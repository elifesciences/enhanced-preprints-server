import { Content, contentToHtml } from './content';

const examples:Array<Array<Content>> = [
  ['This is a string', 'This is a string'],
  [['This ', 'is ', 'an ', 'array ', 'of ', 'strings'], 'This is an array of strings'],
  [{ type: 'Emphasis', content: 'emphasised' }, '<em>emphasised</em>'],
  [[{ type: 'Emphasis', content: 'emphasised' }, ' normal text'], '<em>emphasised</em> normal text'],
  [[{ type: 'Emphasis', content: ['emphasised'] }, ' normal text'], '<em>emphasised</em> normal text'],
  [{ type: 'Strong', content: 'text' }, '<strong>text</strong>'],
  [['This is an array with ', { type: 'Emphasis', content: ['emphasised and ', { type: 'Strong', content: 'strong' }] }, ' text'], 'This is an array with <em>emphasised and <strong>strong</strong></em> text'],
];

describe('utils', () => {
  it.each(examples)('process %o to equal "%s"', (input, expected) => {
    const title = contentToHtml(input);

    expect(title).toStrictEqual(expected);
  });
});
