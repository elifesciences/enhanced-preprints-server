import axios from 'axios';

export type HypothesisResponse = {
  text: string,
}

type FetchReviews = (doi: string, reviewingGroup: string) => Promise<Array<string>>;
export const fetchReviews: FetchReviews = async (doi, reviewingGroup) => {
  const docmaps = await fetchDocmaps(doi);
  const docmap = docmaps.find(docmap => docmap.publisher.id === reviewingGroup);
  if (!docmap) {
    return Promise.resolve([]);
  }
  const hypothesisUrls = Object.values(docmap.steps)
    .flatMap(docmapStep => docmapStep.actions
      .flatMap(action => action.outputs
        .flatMap(output => output.content
          .filter(content => content.type == "web-page" && content.url.includes('://hypothes.is/'))
          .flatMap(content => content.url)
        )
      )
    );

  if (!hypothesisUrls.length) {
    return Promise.resolve([]);
  }
  const hypothesisIds = hypothesisUrls.map(url => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length -1];
  });

  const hypothesisResponses = await Promise.all(hypothesisIds.map(id => {
    return axios.get<HypothesisResponse>(`https://api.hypothes.is/api/annotations/${id}`);
  }));

  return await Promise.all(hypothesisResponses.map(async (response) => {
    const { text } = response.data;
    return text;
  }));
}

type FetchDocmap = (doi: string) => Promise<Array<Docmap>>;
const fetchDocmaps: FetchDocmap = async (doi) => {
  return axios.get<Array<Docmap>>(`https://sciety.org/docmaps/v1/articles/${doi}.docmap.json`).then(async (response) => response.data).catch(() => []);
}

type DocmapStep = {
  actions: {
    outputs: {
      type: string,
      published: string,
      content: {
        type: string,
        url: string,
      }[]
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
