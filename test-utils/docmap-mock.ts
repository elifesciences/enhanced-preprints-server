export const docmapMock = {
  publisher: {
    id: 'https://elifesciences.org/',
    logo: 'https://sciety.org/static/groups/elife--b560187e-f2fb-4ff9-a861-a204f3fc0fb0.png',
  },
  steps: {
    '_:b0': {
      assertions: [],
      inputs: [{ doi: '10.1101/2021.06.02.446694', url: 'https://doi.org/10.1101/2021.06.02.446694' }],
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
            url: 'https://sciety.org/articles/activity/10.1101/2021.06.02.446694#hypothesis:sQ7jVo5DEeyQwX8SmvZEzw',
          }, {
            type: 'web-content',
            url: 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-three.html',
          }],
        }],
      }, {
        participants: [{ actor: { name: 'anonymous', type: 'person' }, role: 'peer-reviewer' }],
        outputs: [{
          type: 'review-article',
          published: '2022-02-15T09:43:13.592Z',
          content: [{
            type: 'web-page',
            url: 'https://hypothes.is/a/saaeso5DEeyNd5_qxlJjXQ',
          }, {
            type: 'web-page',
            url: 'https://sciety.org/articles/activity/10.1101/2021.06.02.446694#hypothesis:saaeso5DEeyNd5_qxlJjXQ',
          }, {
            type: 'web-content',
            url: 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-two.html',
          }],
        }],
      }, {
        participants: [{ actor: { name: 'anonymous', type: 'person' }, role: 'peer-reviewer' }],
        outputs: [{
          type: 'review-article',
          published: '2022-02-15T09:43:14.350Z',
          content: [{
            type: 'web-page',
            url: 'https://hypothes.is/a/shmDUI5DEey0T6t05fjycg',
          }, {
            type: 'web-page',
            url: 'https://sciety.org/articles/activity/10.1101/2021.06.02.446694#hypothesis:shmDUI5DEey0T6t05fjycg',
          }, {
            type: 'web-content',
            url: 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html',
          }],
        }],
      }, {
        participants: [{
          actor: {
            name: 'Ronald L Calabrese',
            type: 'person',
            _relatesToOrganization: 'Emory University, United States',
          },
          role: 'senior-editor',
        }, {
          actor: {
            name: 'Noah J Cowan',
            type: 'person',
            _relatesToOrganization: 'Johns Hopkins University, United States',
          },
          role: 'editor',
        }],
        outputs: [{
          type: 'evaluation-summary',
          published: '2022-02-15T09:43:15.348Z',
          content: [{
            type: 'web-page',
            url: 'https://hypothes.is/a/srHqyI5DEeyY91tQ-MUVKA',
          }, {
            type: 'web-page',
            url: 'https://sciety.org/articles/activity/10.1101/2021.06.02.446694#hypothesis:srHqyI5DEeyY91tQ-MUVKA',
          }, {
            type: 'web-content',
            url: 'https://sciety.org/static/docmaps/hardcoded-elife-article-evaluation-summary.html',
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
            url: 'https://sciety.org/articles/activity/10.1101/2021.06.02.446694#hypothesis:ySfx9I5REeyOiqtIYslcxA',
          }, { type: 'web-content', url: 'https://sciety.org/static/docmaps/hardcoded-elife-article-reply.html' }],
        }],
      }],
    },
  },
};

export const reviewMocks: Record<string, string> = {
  'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html': 'one',
  'https://sciety.org/static/docmaps/hardcoded-elife-article-review-two.html': 'two',
  'https://sciety.org/static/docmaps/hardcoded-elife-article-review-three.html': 'three',
  'https://sciety.org/static/docmaps/hardcoded-elife-article-reply.html': 'reply',
  'https://sciety.org/static/docmaps/hardcoded-elife-article-evaluation-summary.html': 'summary',
};
