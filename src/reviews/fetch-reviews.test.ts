import { fetchReviews, HypothesisResponse } from './fetch-reviews';
import axios from 'axios';
import { mocked } from 'jest-mock';
import { docmapMock } from "../../test-utils/docmap-mock";

jest.mock('axios');

const mockedReviews: Record<string, HypothesisResponse> = {
  Q9GJ9BC0EeyPVBtgAn5Yjw: { "text": "review1" },
  "A2ZbGBCxEeyu-CsIpygfMQ": { "text": "review2" },
  J2qSChC1EeyvHS8fi9T9oQ: { "text": "review3" },
};

describe('fetch-reviews', () => {
  it('fetches docmap from Sciety for a specific reviewing group', async () => {
    const mockedGet = mocked(axios.get, true);

    mockedGet.mockImplementation((url) => {
      const response = {
        data: {},
        status: 200,
      }
      if (url.includes('docmap')) {
        response.data = docmapMock;
      } else {
        const id = url.split('/').pop() || '';
        response.data = mockedReviews[id];
      }
      return Promise.resolve(response);
    });

    const reviews = await fetchReviews('10.1101/2021.07.05.451181', 'https://biophysics.sciencecolab.org');

    expect(reviews).toHaveLength(3);
    expect(reviews).toStrictEqual(expect.arrayContaining(['review1', 'review2', 'review3',]));
    expect(mockedGet).toHaveBeenNthCalledWith(2, expect.stringContaining('Q9GJ9BC0EeyPVBtgAn5Yjw'));
    expect(mockedGet).toHaveBeenNthCalledWith(3, expect.stringContaining('A2ZbGBCxEeyu-CsIpygfMQ'));
    expect(mockedGet).toHaveBeenNthCalledWith(4, expect.stringContaining('J2qSChC1EeyvHS8fi9T9oQ'));
  });

  describe('when unable to retrieve the docmap', () => {
    it.todo('returns empty array on http errors');
    it.todo('returns empty array if there are no hypothesis link in the docmap');
  })
});
