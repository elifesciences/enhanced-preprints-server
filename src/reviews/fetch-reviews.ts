import axios from 'axios';
import { Evaluation, PeerReview, ReviewType } from '../model/model';

export type HypothesisResponse = {
  text: string,
};

type FetchReviews = (doi: string, reviewingGroup: string) => Promise<PeerReview | string>;

type FetchDocmap = (doi: string) => Promise<Docmap>;
// const fetchDocmaps: FetchDocmap = async (doi) => axios.get<Array<Docmap>>(`https://sciety.org/docmaps/v1/articles/${doi}.docmap.json`).then(async (response) => response.data).catch(() => []);
const fetchDocmaps: FetchDocmap = async (doi) => axios.get<Docmap>('https://staging.sciety.org/docmaps/v1/evaluations-by/elife/10.1101/2021.06.02.446694.docmap.json').then(async (response) => response.data);

const getTextFromContent = async (contents: DocmapContent[]): Promise<string> => {
  let rawUrl = '';
  contents.forEach((content) => {
    if (content['_raw-html']) {
      rawUrl = content['_raw-html'];
    }
  });

  if (!rawUrl.length) {
    return '';
  }
  return (await axios.get(rawUrl)).data;
};

export const fetchReviews: FetchReviews = async (doi) => {
  let docmap;
  try {
    docmap = await fetchDocmaps(doi);
  } catch (error) {
    return `Unable to retrieve docmap for article: ${doi}`;
  }

  const evaluations = await Promise.all(Object.values(docmap.steps)
    .flatMap((docmapStep) => docmapStep.actions)
    .flatMap((action) => action.outputs)
    .map<Promise<Evaluation>>(async (output) => ({
    date: new Date(output.published),
    reviewType: <ReviewType> output.type,
    text: await getTextFromContent(output.content),
  })));

  const evaluationSummary = evaluations.find((evaluation) => evaluation.reviewType === ReviewType.EvaluationSummary);
  if (!evaluationSummary) {
    return 'Summary is missing from evaluations';
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
  '_raw-html'?: string,
};

type DocmapStep = {
  actions: {
    outputs: {
      type: string,
      published: string,
      content: DocmapContent[]
    }[]
  }[]
};

type Docmap = {
  publisher: {
    id: string,
    logo: string,
  },
  steps: Record<string, DocmapStep>
};
