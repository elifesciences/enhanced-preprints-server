import { fetchReviews } from './fetch-reviews';
import axios from 'axios';
import { mocked } from 'jest-mock';

jest.mock('axios');

const mockedDocmap = `
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

const mockedReviews = [
  '{"id": "Q9GJ9BC0EeyPVBtgAn5Yjw", "created": "2021-09-08T14:51:35.722360+00:00", "updated": "2021-09-08T15:44:52.871334+00:00", "user": "acct:biophysics_sciencecolab@hypothes.is", "uri": "https://www.biorxiv.org/content/10.1101/2021.07.05.451181v1", "text": "review1", "tags": [], "group": "e277wiod", "permissions": {"read": ["group:__world__"], "admin": ["acct:biophysics_sciencecolab@hypothes.is"], "update": ["acct:biophysics_sciencecolab@hypothes.is"], "delete": ["acct:biophysics_sciencecolab@hypothes.is"]}, "target": [{"source": "https://www.biorxiv.org/content/10.1101/2021.07.05.451181v1"}], "document": {"title": ["Single-molecule imaging with cell-derived nanovesicles reveals early binding dynamics at a cyclic nucleotide-gated ion channel"]}, "links": {"html": "https://hypothes.is/a/Q9GJ9BC0EeyPVBtgAn5Yjw", "incontext": "https://hyp.is/Q9GJ9BC0EeyPVBtgAn5Yjw/www.biorxiv.org/content/10.1101/2021.07.05.451181v1", "json": "https://hypothes.is/api/annotations/Q9GJ9BC0EeyPVBtgAn5Yjw"}, "user_info": {"display_name": null}, "flagged": false, "hidden": false}',
  '{"id": "A2ZbGBCxEeyu-CsIpygfMQ", "created": "2021-09-08T14:28:19.243832+00:00", "updated": "2021-09-08T14:28:19.243832+00:00", "user": "acct:biophysics_sciencecolab@hypothes.is", "uri": "https://www.biorxiv.org/content/10.1101/2021.07.05.451181v1", "text": "review2", "tags": [], "group": "e277wiod", "permissions": {"read": ["group:__world__"], "admin": ["acct:biophysics_sciencecolab@hypothes.is"], "update": ["acct:biophysics_sciencecolab@hypothes.is"], "delete": ["acct:biophysics_sciencecolab@hypothes.is"]}, "target": [{"source": "https://www.biorxiv.org/content/10.1101/2021.07.05.451181v1"}], "document": {"title": ["Single-molecule imaging with cell-derived nanovesicles reveals early binding dynamics at a cyclic nucleotide-gated ion channel"]}, "links": {"html": "https://hypothes.is/a/A2ZbGBCxEeyu-CsIpygfMQ", "incontext": "https://hyp.is/A2ZbGBCxEeyu-CsIpygfMQ/www.biorxiv.org/content/10.1101/2021.07.05.451181v1", "json": "https://hypothes.is/api/annotations/A2ZbGBCxEeyu-CsIpygfMQ"}, "user_info": {"display_name": null}, "flagged": false, "hidden": false}',
  '{"id": "J2qSChC1EeyvHS8fi9T9oQ", "created": "2021-09-08T14:57:57.652991+00:00", "updated": "2021-09-08T14:57:57.652991+00:00", "user": "acct:biophysics_sciencecolab@hypothes.is", "uri": "https://www.biorxiv.org/content/10.1101/2021.07.05.451181v1", "text": "review3", "tags": [], "group": "e277wiod", "permissions": {"read": ["group:__world__"], "admin": ["acct:biophysics_sciencecolab@hypothes.is"], "update": ["acct:biophysics_sciencecolab@hypothes.is"], "delete": ["acct:biophysics_sciencecolab@hypothes.is"]}, "target": [{"source": "https://www.biorxiv.org/content/10.1101/2021.07.05.451181v1"}], "document": {"title": ["Single-molecule imaging with cell-derived nanovesicles reveals early binding dynamics at a cyclic nucleotide-gated ion channel"]}, "links": {"html": "https://hypothes.is/a/J2qSChC1EeyvHS8fi9T9oQ", "incontext": "https://hyp.is/J2qSChC1EeyvHS8fi9T9oQ/www.biorxiv.org/content/10.1101/2021.07.05.451181v1", "json": "https://hypothes.is/api/annotations/J2qSChC1EeyvHS8fi9T9oQ"}, "user_info": {"display_name": null}, "flagged": false, "hidden": false}',
];

describe('fetch-reviews', () => {
  it('fetches docmap from Sciety for a specific reviewing group', async () => {
    const mockedGet = mocked(axios.get, true);

    mockedGet.mockImplementationOnce(() => {
      return Promise.resolve({
        data: JSON.parse(mockedDocmap),
        status: 200,
      });
    })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          data: JSON.parse(mockedReviews[0]),
          status: 200,
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          data: JSON.parse(mockedReviews[1]),
          status: 200,
        });
      })
      .mockImplementationOnce(() => {
        return Promise.resolve({
          data: JSON.parse(mockedReviews[2]),
          status: 200,
        });
      });

    const reviews = await fetchReviews('10.1101/2021.07.05.451181', 'https://biophysics.sciencecolab.org');

    expect(reviews).toHaveLength(3);
    expect(reviews).toStrictEqual(expect.arrayContaining(['review1', 'review2', 'review3',]));
    expect(mockedGet).toHaveBeenNthCalledWith(2, expect.stringContaining('Q9GJ9BC0EeyPVBtgAn5Yjw'));
    expect(mockedGet).toHaveBeenNthCalledWith(3, expect.stringContaining('A2ZbGBCxEeyu-CsIpygfMQ'));
    expect(mockedGet).toHaveBeenNthCalledWith(4, expect.stringContaining('J2qSChC1EeyvHS8fi9T9oQ'));
  });
});
