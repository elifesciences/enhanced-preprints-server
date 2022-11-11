export const docmapMock = {
  publisher: {
    id: 'https://elifesciences.org/',
    logo: 'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
  },
  steps: {
    '_:b0': {
      assertions: [],
      inputs: [{ doi: '10.1101/654321', url: 'https://doi.org/10.1101/654321' }],
      actions: [{
        participants: [{ actor: { name: 'anonymous', type: 'person' }, role: 'peer-reviewer' }],
        outputs: [{
          type: 'review-article',
          published: '2022-02-15T09:43:12.593Z',
          content: [{
            type: 'web-page',
            url: 'https://hypothes.is/a/sQ7jVo5DEeyQwX8SmvZEzw',
          }, {
            type: 'web-page',
            url: 'https://sciety.org/articles/activity/10.1101/654321#hypothesis:sQ7jVo5DEeyQwX8SmvZEzw',
          }, {
            type: 'web-content',
            url: 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html',
          }],
        }],
      }, {
        participants: [{ actor: { name: 'anonymous', type: 'person' }, role: 'peer-reviewer' }],
        outputs: [{
          type: 'reply',
          published: '2022-02-15T11:24:05.730Z',
          content: [{
            type: 'web-page',
            url: 'https://hypothes.is/a/ySfx9I5REeyOiqtIYslcxA',
          }, {
            type: 'web-page',
            url: 'https://sciety.org/articles/activity/10.1101/654321#hypothesis:ySfx9I5REeyOiqtIYslcxA',
          }, { type: 'web-content', url: 'https://sciety.org/static/docmaps/hardcoded-elife-article-reply.html' }],
        }],
      }],
    },
  },
};

export const reviewMocks: Record<string, string> = {
  'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html': 'one',
  'https://sciety.org/static/docmaps/hardcoded-elife-article-reply.html': 'reply',
  'https://sciety.org/static/docmaps/hardcoded-elife-article-evaluation-summary.html': 'summary',
};
