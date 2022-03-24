import axios from 'axios';

type HypothesisResponse = {
  text: string,
}

type FetchReviews = (doi: string, reviewingGroup: string) => Promise<Array<string>>;
export const fetchReviews: FetchReviews = async (doi, reviewingGroup) => {
  const docmaps = fetchDocmaps(doi);
  const docmap = docmaps.find(docmap => docmap.publisher.id === reviewingGroup);
  if (!docmap) {
    return Promise.reject(`No docmap for reviewingGroup: ${reviewingGroup} and doi: ${doi}`);
  }
  const hypothesisUrls = Object.values(docmap.steps)
    .flatMap(docmapStep => docmapStep.actions
      .flatMap(action => action.outputs
        .flatMap(output => output.content
          .filter(content => content.url.includes('hypothes.is'))
          .flatMap(content => content.url)
        )
      )
    );

  const hypothesisIds = hypothesisUrls.map(url => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length -1];
  });

  const hypothesisResponses = await Promise.all(hypothesisIds.map(id => {
    return axios(`https://api.hypothes.is/api/annotations/${id}`);
  }));

  return await Promise.all(hypothesisResponses.map(async (response) => {
    const { text } = await response.data as HypothesisResponse;
    return text;
  }));
}

type FetchDocmap = (doi: string) => Array<Docmap>;
const fetchDocmaps: FetchDocmap = () => {
  return JSON.parse(hardCodedDocmap);
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
const hardCodedDocmap = `
[
  {
    "@context": "https://w3id.org/docmaps/context.jsonld",
    "id": "https://sciety.org/docmaps/v1/articles/10.1101/2021.07.05.451181/biophysics-colab.docmap.json",
    "type": "docmap",
    "created": "2021-11-10T15:54:51.000Z",
    "updated": "2021-11-10T15:54:51.000Z",
    "publisher": {
      "id": "https://www.sciencecolab.org/biophysics-colab",
      "name": "biophysics COLAB",
      "logo": "https://static.wixstatic.com/media/1f1e58_cde9872c8ecf470d8f8238a81a1d4f1b~mv2.png/v1/fill/w_492,h_192,al_c,usm_0.66_1.00_0.01,enc_auto/210628_Biophysics%20Logo_FINAL%202.png",
      "homepage": "https://www.sciencecolab.org/biophysics-colab",
      "account": {
        "id": "https://sciety.org/groups/biophysics-colab",
        "service": "https://sciety.org"
      }
    },
    "first-step": "_:b0",
    "steps": {
      "_:b0": {
        "assertions": [],
        "inputs": [
          {
            "doi": "10.1101/2021.07.05.451181",
            "url": "https://doi.org/10.1101/2021.07.05.451181"
          }
        ],
        "actions": [
          {
            "participants": [
              {
                "actor": {
                  "name": "Gabriel Fitzgerald",
                  "type": "person"
                },
                "role": "peer-reviewer"
              },
              {
                "actor": {
                  "name": "Pablo Miranda",
                  "type": "person"
                },
                "role": "peer-reviewer"
              },
              {
                "actor": {
                  "name": "Kenton J. Swartz",
                  "type": "person"
                },
                "role": "peer-reviewer"
              }
            ],
            "outputs": [
              {
                "type": "review-article",
                "published": "2021-09-08T14:28:19.000Z",
                "content": [
                  {
                    "type": "web-page",
                    "url": "https://hypothes.is/a/A2ZbGBCxEeyu-CsIpygfMQ"
                  },
                  {
                    "type": "web-page",
                    "url": "https://sciety.org/articles/activity/10.1101/2021.07.05.451181#hypothesis:A2ZbGBCxEeyu-CsIpygfMQ"
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }
]`;
