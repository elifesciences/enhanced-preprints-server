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
  it.each([
    ['multi', 'strings'],
    { type: 'Paragraph', content: 'PARAGRAPH!!!' },
    [{ type: 'Paragraph', content: 'PARAGRAPH!!!' }, { type: 'Strong', content: 'STRONG!!!' }],
    ['This is a ', { type: 'Strong', content: 'STRONG!!!' }, ' string'],
    ['This is a ', { type: 'Strong', content: [{ type: 'Paragraph', content: 'PARAGRAPH!!!' }, 'foo'] }, ' string'],
  ])('validates correct content', (value) => {
    const enhancedArticle = {
      ...enhancedArticleExample,
      article: {
        ...enhancedArticleExample.article,
        content: value,
      },
    };
    expect(EnhancedArticleSchema.validate(enhancedArticle).error).toStrictEqual(undefined);
  });
  it('coerces dates', () => {
    const enhancedArticle = EnhancedArticleSchema.validate(enhancedArticleExample);

    expect(enhancedArticle.error).toBeUndefined();
    expect(enhancedArticle.value.article.date).toStrictEqual(new Date('2023-01-02'));
    expect(enhancedArticle.value.preprintPosted).toStrictEqual(new Date('2023-01-02'));
    expect(enhancedArticle.value.sentForReview).toStrictEqual(new Date('2023-01-03'));
    expect(enhancedArticle.value.published).toStrictEqual(new Date('2023-01-23'));
  });
});
