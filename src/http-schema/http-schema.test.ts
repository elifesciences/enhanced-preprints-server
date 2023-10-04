import { EnhancedArticleSchema, SubjectsSchema } from './http-schema';

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
    licenses: [
      {
        type: 'CreativeWork',
        url: 'http://creativecommons.org/licenses/by/4.0/',
      },
      {
        type: 'CreativeWork',
        content: [
          {
            type: 'Paragraph',
            content: [
              'The copyright holder for this pre-print is the author. All rights reserved. The material may not be redistributed, re-used or adapted without the author\'s permission.',
            ],
          },
        ],
      },
    ],
    content: 'This is some test content',
    references: [
      {
        type: 'Article',
        id: 'ref1',
        title: 'Reference 1',
        authors: [],
      },
      {
        type: 'Article',
        id: 'ref2',
        title: 'Reference 2',
        authors: [],
        pageStart: 1,
        pageEnd: 2,
      },
      {
        type: 'Article',
        id: 'ref3',
        title: 'Reference 3',
        authors: [],
        pageStart: 'one',
        pageEnd: 'two',
      },
    ],
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
    ['one', 'two', { type: 'Strong', content: { type: 'NontextualAnnotation', content: 'three' } }],
    ['', 'with', '', 'empty', { type: 'Strong', content: 'strings' }, ''],
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
      content: 'I am a simple figure',
    },
    {
      type: 'Figure',
      content: 'I am a figure with caption, label and id',
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
    {
      type: 'List',
      order: 'Unordered',
      items: [
        {
          type: 'ListItem',
          content: 'one',
        },
        {
          type: 'ListItem',
          content: ['two'],
        },
        {
          type: 'ListItem',
          content: [
            {
              type: 'Strong',
              content: 'three',
            },
          ],
        },
      ],
    },
    {
      type: 'Claim',
      claimType: 'Statement',
      label: 'This is a label',
      title: [
        {
          type: 'Heading',
          depth: 1,
          content: 'heading',
          id: 'h1',
        },
      ],
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
    { message: '"published" is required' },
  ];

  it.each([
    [{}, allRequiredFieldValidationMessages],
    [{ id: '12345', msid: 1, published: null }, [{ message: '"msid" must be a string' }, ...sampleRequiredFieldValidationMessages]],
    [{ id: '12345', msid: 'id', published: 'not a date' }, [...sampleRequiredFieldValidationMessages, { message: '"published" must be a valid date' }]],
    [{ publishedYear: 'one' }, [...allRequiredFieldValidationMessages, { message: '"publishedYear" must be a number' }]],
    // Verify that publishedYear can also be a numeric string.
    [{ publishedYear: '2023' }, [...allRequiredFieldValidationMessages]],
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

  it('will convert publishedYear to number from string', () => {
    const enhancedArticle = EnhancedArticleSchema.validate({
      ...enhancedArticleExample,
      publishedYear: '2023',
    });

    expect(enhancedArticle.error).toBeUndefined();
    expect(typeof enhancedArticle.value?.publishedYear).toStrictEqual('number');
    expect(enhancedArticle.value?.publishedYear).toStrictEqual(2023);
  });

  it('parses optional values', () => {
    const articleWithOptionals = {
      ...enhancedArticleExample,
      subjects: [
        'subject 1',
        'subject 2',
      ],
      volume: '1',
      eLocationId: 'RP12356',
      versionDoi: '10.7554/123456',
      publishedYear: '2023',
      sentForReview: '2023-07-31',
      peerReview: {
        evaluationSummary: {
          date: '2023-08-01',
          reviewType: 'evaluation-summary',
          text: 'This is a great paper',
          participants: [],
        },
        authorResponse: {
          date: '2023-08-01',
          reviewType: 'author-response',
          text: 'I know',
          participants: [],
        },
        reviews: [],
      },
      published: '2023-08-02',
    };

    const enhancedArticle = EnhancedArticleSchema.validate(articleWithOptionals);

    expect(enhancedArticle.error).toBeUndefined();
  });

  it.each([
    [['subject1', 'subject2'], ''],
    [['subject1', 'subject1'], '"[1]" contains a duplicate value'],
    [['', 'subject1'], '"[0]" is not allowed to be empty'],
    [['subject1', ['subject2']], '"[1]" must be a string'],
  ])('validate subjects array: %s', (input, message?) => {
    const result = SubjectsSchema.validate(input);
    if (message) {
      expect(result.error).toBeDefined();
      expect(result.error?.message).toStrictEqual(message);
    } else {
      expect(result.error).toBeUndefined();
    }
  });
});
