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
    'foo',
    ['one', 'two', { type: 'Strong', content: 'three' }],
    {
      type: 'Heading', depth: 1, content: 'heading', id: 'h1',
    },
    {
      type: 'Cite',
      content: 'I am a citation',
      target: 'target',
    },
    {
      type: 'Link',
      content: 'I am a link',
      target: 'target',
    },
    {
      type: 'Paragraph',
      content: 'I am a paragraph',
    },
    {
      type: 'Emphasis',
      content: 'I am emphasised',
    },
    {
      type: 'Strong',
      content: 'I am strong',
    },
    {
      type: 'Superscript',
      content: 'I am super',
    },
    {
      type: 'Subscript',
      content: 'I am a subscript',
    },
    {
      type: 'Date',
      content: '13/01/2001',
    },
    {
      type: 'Figure',
      content: 'I am a figure',
      caption: 'I am a caption',
      label: 'I am a label',
      id: 'id',
    },
    {
      type: 'ImageObject',
      contentUrl: 'https://placekitten.com/500/300',
      content: [],
      meta: {
        inline: false,
      },
    },
    [
      [{
        type: 'Heading', depth: 1, content: 'heading', id: 'h1',
      }],
    ],
  ])('validates %s content', (value) => {
    const enhancedArticle = {
      ...enhancedArticleExample,
      article: {
        ...enhancedArticleExample.article,
        content: value,
      },
    };
    expect(EnhancedArticleSchema.validate(enhancedArticle).error).toBeUndefined();
  });

  it.each([
    [{id: '12345', msid: 1}, '"msid" must be a string'],
    [{unknown: 'unknown'}, '"unknown" is not allowed'],
    [{unknown1: 'unknown', unknown2: 'unknown'}, '"unknown1" is not allowed'],
  ])('handles validation error', (value, error) => {
    const invalidateEnhancedArticle = EnhancedArticleSchema.validate(value);

    expect(invalidateEnhancedArticle.error).toBeDefined();
    expect(invalidateEnhancedArticle.error?.details).toHaveLength(1);
    expect(invalidateEnhancedArticle.error?.details.at(0)?.message).toStrictEqual(error);
  });

  it('coerces dates', () => {
    const enhancedArticle = EnhancedArticleSchema.validate(enhancedArticleExample);

    expect(enhancedArticle.error).toBeUndefined();
    expect(enhancedArticle.value?.article.date).toStrictEqual(new Date('2023-01-02'));
    expect(enhancedArticle.value?.preprintPosted).toStrictEqual(new Date('2023-01-02'));
    expect(enhancedArticle.value?.sentForReview).toStrictEqual(new Date('2023-01-03'));
    expect(enhancedArticle.value?.published).toStrictEqual(new Date('2023-01-23'));
  });
});
