import axios from 'axios';
import { Participant, PeerReview, ReviewType } from '../model/model';

type FetchReviews = (doi: string, reviewingGroup: string) => Promise<PeerReview>;

type FetchDocmap = (doi: string) => Promise<Docmap>;
const fetchDocmaps: FetchDocmap = async (doi) => axios.get<Docmap>(`https://staging.sciety.org/docmaps/v1/evaluations-by/elife/${doi}.docmap.json`).then(async (response) => response.data);

export const fetchReviews: FetchReviews = async (doi) => {
  let docmap;
  try {
    docmap = await fetchDocmaps(doi);
  } catch (error) {
    throw Error(`Unable to retrieve docmap for article ${doi}: ${error}`);
  }

  const evaluations = await Promise.all(Object.values(docmap.steps)
    .flatMap((docmapStep) => docmapStep.actions)
    .flatMap(({ participants, outputs }) => outputs.map((output) => ({ ...output, participants })))
    .reduce((previousValue, currentValue) => {
      const webContent = currentValue.content.find((content) => content.type === 'web-content');
      const participants = currentValue.participants.map((participant) => ({ name: participant.actor.name, role: participant.role }));
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
      const response = await axios.get(url);
      const text = await response.data;

      return { text, ...rest };
    }));

  const evaluationSummary = evaluations.find((evaluation) => evaluation.reviewType === ReviewType.EvaluationSummary);
  if (!evaluationSummary) {
    throw Error(`Summary is missing from evaluations for article ${doi}`);
  }

  return {
    reviews: evaluations.filter((evaluation) => evaluation.reviewType === ReviewType.Review),
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
