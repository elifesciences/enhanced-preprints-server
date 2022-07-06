import axios from 'axios';
import { mocked } from 'jest-mock';
import { fetchReviews, HypothesisResponse } from './fetch-reviews';
import { docmapMock, docmapNoHypothesisMock } from '../../test-utils/docmap-mock';

jest.mock('axios');

const mockedReviews: Record<string, HypothesisResponse> = {
  Q9GJ9BC0EeyPVBtgAn5Yjw: { text: 'review1' },
  'A2ZbGBCxEeyu-CsIpygfMQ': { text: 'review2' },
  J2qSChC1EeyvHS8fi9T9oQ: { text: 'review3' },
};

describe('fetch-reviews', () => {
  describe('when unable to retrieve the docmap', () => {
    it('returns empty array on http errors', async () => {
      const mockedGet = mocked(axios.get, true);
      // eslint-disable-next-line prefer-promise-reject-errors
      mockedGet.mockImplementation(() => Promise.reject({
        data: {},
        status: 404,
      }));

      expect(await fetchReviews('10.1101/2021.07.05.451181', 'https://biophysics.sciencecolab.org')).toThrow();
    });

    it('returns empty array if there are no hypothesis link in the docmap', async () => {
      const mockedGet = mocked(axios.get, true);
      // @ts-ignore
      mockedGet.mockImplementation(() => Promise.resolve({
        data: docmapNoHypothesisMock,
        status: 200,
      }));
      const reviews = await fetchReviews('10.1101/2021.07.05.451181', 'https://biophysics.sciencecolab.org');

      expect(reviews).toStrictEqual([]);
    });
  });
});
