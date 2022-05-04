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
          .filter(content => content.type == "web-page" && content.url.includes('://hypothes.is/'))
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
    "created": "2021-09-08T15:06:52.000Z",
    "updated": "2021-09-08T15:06:52.000Z",
    "publisher": {
      "id": "https://biophysics.sciencecolab.org",
      "name": "Biophysics Colab",
      "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
      "homepage": "https://biophysics.sciencecolab.org",
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
                  "name": "anonymous",
                  "type": "person"
                },
                "role": "peer-reviewer"
              }
            ],
            "outputs": [
              {
                "type": "review-article",
                "published": "2021-09-08T14:51:35.722Z",
                "content": [
                  {
                    "type": "web-page",
                    "url": "https://hypothes.is/a/Q9GJ9BC0EeyPVBtgAn5Yjw"
                  },
                  {
                    "type": "web-page",
                    "url": "https://sciety.org/articles/activity/10.1101/2021.07.05.451181#hypothesis:Q9GJ9BC0EeyPVBtgAn5Yjw"
                  }
                ]
              }
            ]
          },
          {
            "participants": [
              {
                "actor": {
                  "name": "anonymous",
                  "type": "person"
                },
                "role": "peer-reviewer"
              }
            ],
            "outputs": [
              {
                "type": "review-article",
                "published": "2021-09-08T14:28:19.243Z",
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
          },
          {
            "participants": [
              {
                "actor": {
                  "name": "anonymous",
                  "type": "person"
                },
                "role": "peer-reviewer"
              }
            ],
            "outputs": [
              {
                "type": "review-article",
                "published": "2021-09-08T14:57:57.652Z",
                "content": [
                  {
                    "type": "web-page",
                    "url": "https://hypothes.is/a/J2qSChC1EeyvHS8fi9T9oQ"
                  },
                  {
                    "type": "web-page",
                    "url": "https://sciety.org/articles/activity/10.1101/2021.07.05.451181#hypothesis:J2qSChC1EeyvHS8fi9T9oQ"
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
