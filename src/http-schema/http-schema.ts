import Joi from 'joi';

const ParagraphSchema = Joi.object({
  type: Joi.string().valid('Paragraph'),
  content: Joi.link('#Content'),
});

const StrongContentSchema = Joi.object({
  type: Joi.string().valid('Strong'),
  content: Joi.link('#Content'),
});

const DateContentSchema = Joi.object({
  type: Joi.string().valid('Date'),
  content: Joi.link('#Content'),
});

const LinkContentSchema = Joi.object({
  type: Joi.string().valid('Link'),
  target: Joi.string(),
  relation: Joi.string().optional(),
  content: Joi.link('#Content'),
});

const CiteContentSchema = Joi.object({
  type: Joi.string().valid('Cite'),
  content: Joi.link('#Content'),
});

const CiteGroupContentSchema = Joi.object({
  type: Joi.string().valid('CiteGroup'),
  items: Joi.array().items(CiteContentSchema),
});

const ContentPartSchema = Joi.alternatives().try(
  Joi.string(),
  ParagraphSchema,
  StrongContentSchema,
  DateContentSchema,
  LinkContentSchema,
  CiteContentSchema,
  CiteGroupContentSchema,
);

const ContentSchema = Joi.alternatives().try(
  Joi.string(),
  ContentPartSchema,
  Joi.array().items(Joi.alternatives().try(Joi.string(), ContentPartSchema)),
).id('Content');

const ParticipantSchema = Joi.object({
  name: Joi.string(),
  role: Joi.string(),
  institution: Joi.string(),
});
const EvaluationSchema = Joi.object({
  date: Joi.date(),
  reviewType: Joi.string().valid('evaluation-summary', 'review-article', 'reply'), // TODO get this from ENUM?
  text: Joi.string(),
  participants: Joi.array().items(ParticipantSchema),
});

const PeerReviewSchema = Joi.object({
  evaluationSummary: EvaluationSchema,
  reviews: Joi.array().items(EvaluationSchema),
  authorResponse: EvaluationSchema.optional(),
});

const AddressSchema = Joi.object({
  addressCountry: Joi.string(),
});

const OrganisationSchema = Joi.object({
  name: Joi.string(),
  address: AddressSchema.optional(),
});

const IdentifierSchema = Joi.object({
  type: Joi.string(),
  value: Joi.string(),
});

const AuthorSchema = Joi.object({
  familyNames: Joi.array().items(Joi.string()),
  givenNames: Joi.array().items(Joi.string()),
  affiliations: Joi.array().items(OrganisationSchema).optional(),
  emails: Joi.array().items(Joi.string()).optional(),
  identifiers: Joi.array().items(IdentifierSchema).optional(),
});

const LicenseSchema = Joi.object({
  type: Joi.string(),
  url: Joi.string(),
});

const HeadingSchema = Joi.object({
  id: Joi.string(),
  text: ContentSchema,
});

const PublicationSchema = Joi.object({
  type: Joi.string().valid('PublicationVolume', 'Periodical'),
  name: Joi.string(),
  volumeNumber: Joi.number().optional(),
  isPartOf: Joi.link('#Publication'),
}).id('Publication');

const ReferenceSchema = Joi.object({
  type: Joi.string().valid('Article'),
  id: Joi.string(),
  title: Joi.string(),
  url: Joi.string(),
  pageEnd: Joi.number(),
  pageStart: Joi.number(),
  authors: Joi.array().items(AuthorSchema),
  datePublished: Joi.date().optional(),
  isPartOf: PublicationSchema.optional(),
  identifiers: Joi.array().items(Joi.object({
    type: Joi.string(),
    name: Joi.string(),
    propertyID: Joi.string(),
    value: Joi.string(),
  })),
});

const ProcessedArticleSchema = Joi.object({
  doi: Joi.string(),
  title: ContentSchema,
  date: Joi.date(),
  authors: Joi.array().items(AuthorSchema),
  abstract: ContentSchema,
  licenses: Joi.array().items(LicenseSchema),
  content: ContentSchema,
  headings: Joi.array().items(HeadingSchema),
  references: Joi.array().items(ReferenceSchema),
});

export const EnhancedArticleSchema = Joi.object({
  id: Joi.string(),
  msid: Joi.string(),
  doi: Joi.string(),
  versionIdentifier: Joi.string(),
  versionDoi: Joi.string().optional(),
  article: ProcessedArticleSchema,
  preprintDoi: Joi.string(),
  preprintUrl: Joi.string(),
  preprintPosted: Joi.date(),
  sentForReview: Joi.date().optional(),
  peerReview: PeerReviewSchema.optional(),
  published: Joi.date().optional(),
});
