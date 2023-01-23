import { EnhancedArticleSchema } from './http-schema';

const enhancedArticleExample = {
  id: 'testid1',
  msid: 'testmsid1',
  doi: 'doi1',
  versionIdentifier: '1',
  versionDoi: 'publisher/testid1',
  article: {
    doi: 'preprint/testid1',
    title: 'test article',
    date: '2023-01-02',
    authors: [
      {
        familyNames: ['Daffy'],
        givenNames: ['Duck'],
        affiliations: [{ name: 'ACME Labs' }],
        emails: ['daffy.duck@acme.org'],
      },
    ],
    abstract: 'This is the test abstract',
    licenses: [],
    content: 'This is some test content',
    headings: [{ id: 'head1', text: 'Heading 1' }],
    references: [],
  },
  preprintDoi: 'preprint/testid1',
  preprintUrl: 'doi.org/preprint/testid1',
  preprintPosted: '2023-01-02',
  sentForReview: '2023-01-03',
  published: '2023-01-23',
};

describe('httpschema', () => {
  it('coerces dates', () => {
    const enhancedArticle = EnhancedArticleSchema.parse(enhancedArticleExample);
    expect(enhancedArticle.article.date).toStrictEqual(new Date('2023-01-02'));
    expect(enhancedArticle.preprintPosted).toStrictEqual(new Date('2023-01-02'));
    expect(enhancedArticle.sentForReview).toStrictEqual(new Date('2023-01-03'));
    expect(enhancedArticle.published).toStrictEqual(new Date('2023-01-23'));
  });

  it('accepts array of strings content', () => {
    const enhancedArticleExample2 = {
      ...enhancedArticleExample,
      article: {
        ...enhancedArticleExample.article,
        content: ['multi', 'strings'],
      },
    };

    const enhancedArticle = EnhancedArticleSchema.parse(enhancedArticleExample2);
    expect(enhancedArticle.article.content).toStrictEqual(['multi', 'strings']);
  });

  it('accepts content object content', () => {
    const enhancedArticleExample2 = {
      ...enhancedArticleExample,
      article: {
        ...enhancedArticleExample.article,
        content: { type: 'Heading' },
      },
    };

    const enhancedArticle = EnhancedArticleSchema.parse(enhancedArticleExample2);
    expect(enhancedArticle.article.content).toStrictEqual({ type: 'Heading' });
  });

  it('accepts array of content object content', () => {
    const enhancedArticleExample2 = {
      ...enhancedArticleExample,
      article: {
        ...enhancedArticleExample.article,
        content: [{ type: 'Heading' }, { type: 'Subscript', content: 'Hello' }],
      },
    };

    const enhancedArticle = EnhancedArticleSchema.parse(enhancedArticleExample2);
    expect(enhancedArticle.article.content).toStrictEqual([{ type: 'Heading' }, { type: 'Subscript', content: 'Hello' }]);
  });

  it('accepts array of mixed strings and content object content', () => {
    const enhancedArticleExample2 = {
      ...enhancedArticleExample,
      article: {
        ...enhancedArticleExample.article,
        content: ['This is a ', { type: 'Subscript', content: 'subscripted' }, ' string'],
      },
    };

    const enhancedArticle = EnhancedArticleSchema.parse(enhancedArticleExample2);
    expect(enhancedArticle.article.content).toStrictEqual(['This is a ', { type: 'Subscript', content: 'subscripted' }, ' string']);
  });
});
