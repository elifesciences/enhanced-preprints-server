import { normaliseTitleJson } from "./utils";

describe('utils', () => {
  const complicatedTitle: string | (string | {
    content: string[],
    type: string,
  })[] = [
    {"type":"Emphasis", "content":["emphasised"]},
    " normal text",
  ];

  it.each([
    [complicatedTitle, 'emphasised normal text'],
    [JSON.stringify(complicatedTitle), 'emphasised normal text'],
    ['This is a title', 'This is a title'],
  ])('process %o to equal "%s"', (input, expected) => {
    const title = normaliseTitleJson(input);

    expect(title).toStrictEqual(expected);
  })
})
