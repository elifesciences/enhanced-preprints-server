import { z } from 'zod';
// import { Content } from '../model/content';
import { ReviewType } from '../model/model';

// const ContentObjectBaseSchema = z.object({
//   type: z.enum([
//     'Paragraph',
//     'Strong',
//     'Date',
//     'Link',
//     'Cite',
//     'CiteGroup',
//     'Heading',
//     'Figure',
//     'ImageObject',
//     'Emphasis',
//     'Superscript',
//     'Subscript',
//   ]),
// });
// type DecoratedContent = z.infer<typeof ContentObjectBaseSchema> & {
//   content: Content,
// };

// type Publication = z.infer<typeof PublicationBaseSchema> & {
//   isPartOf?: Publication,
// };
// const PublicationSchema: z.ZodType<Publication> = PublicationBaseSchema.extend({
//   isPartOf: z.lazy(() => PublicationBaseSchema.optional()),
// });

// const ContentPartSchema = ContentObjectBaseSchema.or(z.string());
// const ContentPartArraySchema = ContentPartSchema.array();
// const ContentSchema = ContentPartSchema.or(ContentPartArraySchema);
// const DecoratedContentSchema: z.ZodType<DecoratedContent> = ContentObjectBaseSchema.extend({
//   content: z.lazy(() => ContentSchema),
// });
// const HeadingContent = DecoratedContentSchema.extend({
//   type: 'Heading',
//   id: string,
//   depth: 1 | 2 | 3 | 4 | 5 | 6,
// });

const ContentSchema = z.string().or(z.object({}).passthrough());

const ReviewTextSchema = z.string();
const ParticipantSchema = z.object({
  name: z.string(),
  role: z.string(),
  institution: z.string(),
});
const EvaluationSchema = z.object({
  date: z.date(),
  reviewType: z.nativeEnum(ReviewType),
  text: ReviewTextSchema,
  participants: ParticipantSchema.array(),
});

const PeerReviewSchema = z.object({
  evaluationSummary: EvaluationSchema,
  reviews: EvaluationSchema.array(),
  authorResponse: EvaluationSchema.optional(),
});

const AddressSchema = z.object({
  addressCountry: z.string(),
});

const OrganisationSchema = z.object({
  name: z.string(),
  address: AddressSchema.optional(),
});

const IdentifierSchema = z.object({
  type: z.string(),
  value: z.string(),
});

const AuthorSchema = z.object({
  familyNames: z.string().array(),
  givenNames: z.string().array(),
  affiliations: OrganisationSchema.array().optional(),
  emails: z.string().array().optional(),
  identifiers: IdentifierSchema.array().optional(),
});

const LicenseSchema = z.object({
  type: z.string(),
  url: z.string(),
});

const HeadingSchema = z.object({
  id: z.string(),
  text: ContentSchema,
});

const PublicationBaseSchema = z.object({
  type: z.literal('PublicationVolume').or(z.literal('Periodical')),
  name: z.string(),
  volumeNumber: z.number().optional(),
});
type Publication = z.infer<typeof PublicationBaseSchema> & {
  isPartOf?: Publication,
};
const PublicationSchema: z.ZodType<Publication> = PublicationBaseSchema.extend({
  isPartOf: z.lazy(() => PublicationBaseSchema.optional()),
});

const ReferenceSchema = z.object({
  type: z.literal('Article'),
  id: z.string(),
  title: z.string(),
  url: z.string(),
  pageEnd: z.number(),
  pageStart: z.number(),
  authors: AuthorSchema.array(),
  datePublished: z.date().optional(),
  isPartOf: PublicationSchema.optional(),
  identifiers: z.object({
    type: z.string(),
    name: z.string(),
    propertyID: z.string(),
    value: z.string(),
  }).array(),
});

const ProcessedArticleSchema = z.object({
  doi: z.string(),
  title: ContentSchema,
  date: z.date(),
  authors: AuthorSchema.array(),
  abstract: ContentSchema,
  licenses: LicenseSchema.array(),
  content: ContentSchema,
  headings: HeadingSchema.array(),
  references: ReferenceSchema.array(),
});

export const EnhancedArticleSchema = z.object({
  id: z.string(),
  msid: z.string(),
  doi: z.string(),
  versionIdentifier: z.string(),
  versionDoi: z.string().optional(),
  article: ProcessedArticleSchema,
  preprintDoi: z.string(),
  preprintUrl: z.string(),
  preprintPosted: z.date(),
  sentForReview: z.date().optional(),
  peerReview: PeerReviewSchema.optional(),
  published: z.date().optional(),
});
