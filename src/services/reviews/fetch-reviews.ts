import axios from 'axios';
import { Participant, PeerReview, ReviewType } from '../../model/model';

type FetchReviews = (msid: string) => Promise<PeerReview>;

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

export const fetchReviews: FetchReviews = async (msid) => {
  let docmap: Docmap;
  try {
    docmap = await fetchDocmaps(msid);
  } catch (error) {
    throw Error(`Unable to retrieve docmap for article ${msid}: ${error}`);
  }

  const evaluations = await Promise.all(Object.values(docmap.steps)
    .flatMap((docmapStep) => docmapStep.actions)
    .flatMap(({ participants, outputs }) => outputs.map((output) => ({ ...output, participants })))
    .reduce((previousValue, currentValue) => {
      if (!currentValue.content) { // ignore outputs without content
        return previousValue;
      }
      const webContent = currentValue.content.find(isScietyContent);
      const participants = currentValue.participants
        // eslint-disable-next-line no-underscore-dangle
        .map((participant) => ({ name: participant.actor.name, role: roleToFriendlyRole(participant.role), institution: participant.actor._relatesToOrganization }))
        .filter((participant) => participant.role !== 'peer-reviewer');
      if (webContent) {
        previousValue.push({
          date: new Date(currentValue.published),
          reviewType: <ReviewType> currentValue.type,
          url: webContent.url,
          participants,
        });
      }

      return previousValue;
    }, new Array<{ date: Date, reviewType: ReviewType, url: string, participants: Participant[] }>())
    .map(async ({ url, ...rest }) => {
      if (hypothesisCache.has(url)) {
        return { text: hypothesisCache.get(url), ...rest };
      }
      const response = await axios.get(url);
      const text = await response.data;
      hypothesisCache.set(url, text);

      return { text, ...rest };
    }));

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
