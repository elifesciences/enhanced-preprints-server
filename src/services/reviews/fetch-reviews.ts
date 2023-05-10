import axios from 'axios';
import { Participant, PeerReview, ReviewType } from '../../model/model';

type FetchReviews = (msid: string, reviewingGroup: string) => Promise<PeerReview>;

type FetchDocmap = (msid: string) => Promise<Docmap>;
const fetchDocmaps: FetchDocmap = async (msid) => axios.get(`https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-manuscript-id?manuscript_id=${msid}`).then(async (res) => res.data);

const hypothesisCache:Map<string, string> = new Map();

// find a content type that is Sciety's content page
const isScietyContent = (content: { type: string, url: string }): boolean => (content.type === 'web-page' || content.type === 'web-content')
  && content.url.startsWith('https://sciety.org/evaluations/hypothesis:') && content.url.endsWith('/content');

const roleToFriendlyRole = (role: string) => {
  if (role === 'senior-editor') {
    return 'Senior Editor';
  }
  if (role === 'editor') {
    return 'Reviewing Editor';
  }

  return role;
};

export const fetchReviews: FetchReviews = async (id) => {
  let docmap: Docmap;

  // We will not need to infer the reviews from id string after automation.
  const [msid, versionId] = id.split('/');
  const versionPattern = /[1-9][0-9]*$/;
  const version = versionPattern.test(versionId)
    ? parseInt(versionId.match(versionPattern)![0], 10)
    : 1;

  try {
    docmap = await fetchDocmaps(msid);
  } catch (error) {
    throw Error(`Unable to retrieve docmap for article ${msid}: ${error}`);
  }

  const evaluationsGroupedByVersion: { date: Date, reviewType: ReviewType, url: string, participants: Participant[] }[][] = Object.values(docmap.steps)
    .map((step) => step.actions
      .map(
        ({ participants, outputs }) => (
          {
            participants: participants.filter(({ role }) => role !== 'peer-reviewer'),
            outputs: outputs.filter((output) => output.content).map((output) => ({ ...output, content: output.content.filter(isScietyContent) })),
          }
        ),
      )
      .filter(({ outputs }) => outputs.length > 0))
    .filter((step) => step.length > 0)
    .map((evaluationSet) => evaluationSet.map(({ participants, outputs }) => {
      const output = outputs[0];
      const content = output.content[0];
      return {
        date: new Date(output.published),
        reviewType: <ReviewType> output.type,
        url: content.url,
        participants: participants
          // eslint-disable-next-line no-underscore-dangle
          .map((participant) => ({ name: participant.actor.name, role: roleToFriendlyRole(participant.role), institution: participant.actor._relatesToOrganization })),
      };
    }));

  if (evaluationsGroupedByVersion.length === 0 || !((version - 1) in evaluationsGroupedByVersion)) {
    throw Error(`Unable to retrieve reviews for article ${msid} (version: ${version}, entries: ${evaluationsGroupedByVersion.length})`);
  }

  const evaluations = await Promise.all(
    evaluationsGroupedByVersion[version - 1].map(async ({ url, ...rest }) => {
      if (hypothesisCache.has(url)) {
        return { text: hypothesisCache.get(url), ...rest };
      }
      const response = await axios.get(url);
      const text = await response.data;
      hypothesisCache.set(url, text);

      return { text, ...rest };
    }),
  );

  const evaluationSummary = evaluations.find((evaluation) => evaluation.reviewType === ReviewType.EvaluationSummary);
  if (!evaluationSummary) {
    throw Error(`Summary is missing from evaluations for article ${msid}`);
  }

  return {
    reviews: evaluations.filter((evaluation) => evaluation.reviewType === ReviewType.Review)
      .reverse(), // .reverse, because chronology is important to display, but sciety docmaps have reviews and dates ascending in opposite directions
    evaluationSummary,
    authorResponse: evaluations.find((evaluation) => evaluation.reviewType === ReviewType.AuthorResponse),
  };
};

type DocmapContent = {
  type: string,
  url: string,
};

type DocmapStep = {
  actions: {
    outputs: {
      type: string,
      published: string,
      content: DocmapContent[]
    }[],
    participants: {
      actor: {
        name: string,
        type: string,
        '_relatesToOrganization': string,
      },
      role: string,
    }[];
  }[]
};

type Docmap = {
  publisher: {
    id: string,
    logo: string,
  },
  steps: Record<string, DocmapStep>
};
