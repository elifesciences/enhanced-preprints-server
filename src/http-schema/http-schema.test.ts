import { EnhancedArticleSchema } from './http-schema';

const enhancedArticleExample = {
  id: 'testid1',
  msid: 'testmsid1',
  doi: 'doi1',
  versionIdentifier: '1',
  versionDoi: 'publisher/testid1',
  article: {
    title: 'test article',
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

const enhancedArticleFigureExample = {
  id: 'testid1',
  msid: 'testmsid1',
  doi: 'doi1',
  versionIdentifier: '1',
  versionDoi: 'publisher/testid1',
  article: {
    title: 'test article',
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
    content: {
      type: 'Figure',
      id: 'fig6',
      caption: [
        {
          type: 'Heading',
          depth: 2,
          content: [
            'The probability of',
          ],
        },
      ],
      label: 'Figure S1',
      content: [
        {
          type: 'ImageObject',
          contentUrl: '10.1101/000001/v1/figures/2212.00741v1_fig6.jpg',
          meta: {
            inline: false,
          },
        },
      ],
    },
    headings: [{ id: 'head1', text: 'Heading 1' }],
    references: [],
  },
  preprintDoi: 'preprint/testid1',
  preprintUrl: 'doi.org/preprint/testid1',
  preprintPosted: '2023-01-02',
  sentForReview: '2023-01-03',
  published: '2023-01-23',
};

const invalidAuthor = {
  type: 'Person',
  affiliations: [
    {
      type: 'Organization',
      address: {
        type: 'PostalAddress',
        addressLocality: 'Minneapolis MN 55455',
      },
      name: 'Department of Neuroscience and Center for Magnetic Resonance Research, University of Minnesota',
    },
  ],
  emails: [
    'desai054@umn.edu',
    'desai054@umn.edu',
  ],
  familyNames: [
    'Desai',
  ],
  givenNames: [
    'Nisarg',
  ],
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

  const sampleRequiredFieldValidationMessages = [
    { message: '"doi" is required' },
    { message: '"versionIdentifier" is required' },
    { message: '"article" is required' },
    { message: '"preprintDoi" is required' },
    { message: '"preprintUrl" is required' },
    { message: '"preprintPosted" is required' },
  ];

  const allRequiredFieldValidationMessages = [
    { message: '"id" is required' },
    { message: '"msid" is required' },
    ...sampleRequiredFieldValidationMessages,
  ];

  it.each([
    [{}, allRequiredFieldValidationMessages],
    [{ id: '12345', msid: 1 }, [{ message: '"msid" must be a string' }, ...sampleRequiredFieldValidationMessages]],
    [{ unknown: 'unknown' }, [...allRequiredFieldValidationMessages, { message: '"unknown" is not allowed' }]],
    [{ unknown1: 'unknown', unknown2: 'unknown' }, [...allRequiredFieldValidationMessages, { message: '"unknown1" is not allowed' }, { message: '"unknown2" is not allowed' }]],
  ])('handles validation error', (value, errorDetails) => {
    const invalidateEnhancedArticle = EnhancedArticleSchema.validate(value, { abortEarly: false });

    expect(invalidateEnhancedArticle.error).toBeDefined();
    expect(invalidateEnhancedArticle.error?.details).toMatchObject(errorDetails);
  });

  it('coerces dates', () => {
    const enhancedArticle = EnhancedArticleSchema.validate(enhancedArticleExample);

    expect(enhancedArticle.error).toBeUndefined();
    expect(enhancedArticle.value?.preprintPosted).toStrictEqual(new Date('2023-01-02'));
    expect(enhancedArticle.value?.sentForReview).toStrictEqual(new Date('2023-01-03'));
    expect(enhancedArticle.value?.published).toStrictEqual(new Date('2023-01-23'));
  });

  it('validates authors', () => {
    const articleWithBrokenAuthor = enhancedArticleExample;
    articleWithBrokenAuthor.article.authors = [invalidAuthor];
    const enhancedArticle = EnhancedArticleSchema.validate(articleWithBrokenAuthor, { allowUnknown: true });

    expect(enhancedArticle.error).toBeUndefined();
  });

  it('validates figure', () => {
    const enhancedArticle = EnhancedArticleSchema.validate(enhancedArticleFigureExample);

    expect(enhancedArticle.error).toBeUndefined();
  });
});
