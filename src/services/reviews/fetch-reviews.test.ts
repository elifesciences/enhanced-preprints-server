import axios from 'axios';
import { mocked } from 'jest-mock';
import { fetchReviews } from './fetch-reviews';
import { docmapMock, reviewMocks } from '../../../test-utils/docmap-mock';
import { PeerReview } from '../../model/model';

jest.mock('axios');

describe('fetch-reviews', () => {
  describe('parse docmap', () => {
    const mockedGet = mocked(axios.get);

    // @ts-ignore
    mockedGet.mockImplementation((url) => {
      const response = {
        data: {},
        status: 200,
      };
      if (url.includes('?preprint_doi=')) {
        response.data = docmapMock;
      } else {
        response.data = reviewMocks[url];
      }
      return Promise.resolve(response);
    });

    let peerReview: PeerReview;
    beforeAll(async () => {
      peerReview = await fetchReviews('10.1101/2021.07.05.451181', 'test');
    });

    it('extracts the correct participants for each action, maps roles to friendly and strips peer-reviewers', () => {
      expect(peerReview.evaluationSummary.participants).toStrictEqual(expect.arrayContaining([
        { name: 'Ronald L Calabrese', role: 'Senior Editor', institution: 'Emory University, United States' },
        { name: 'Noah J Cowan', role: 'Reviewing Editor', institution: 'Johns Hopkins University, United States' },
      ]));
      expect(peerReview.authorResponse?.participants).toStrictEqual([]);
      expect(peerReview.reviews.flatMap((review) => review.participants)).toStrictEqual([]);
    });

    it('extracts the correct dates for each action', () => {
      expect(peerReview.evaluationSummary.date.getTime()).toStrictEqual(new Date('2022-02-15T09:43:15.348Z').getTime());
      expect(peerReview.authorResponse?.date.getTime()).toStrictEqual(new Date('2022-02-15T11:24:05.730Z').getTime());
      expect(peerReview.reviews.map((review) => review.date.getTime())).toStrictEqual(expect.arrayContaining([
        new Date('2022-02-15T09:43:12.593Z').getTime(),
        new Date('2022-02-15T09:43:13.592Z').getTime(),
        new Date('2022-02-15T09:43:14.350Z').getTime(),
      ]));
    });

    it('fetches the evaluation text for each action with a sciety hypothesis content URL', () => {
      expect(peerReview.evaluationSummary.text).toStrictEqual('summary');
      expect(peerReview.authorResponse?.text).toStrictEqual('reply');
      expect(peerReview.reviews.map((review) => review.text)).toStrictEqual(expect.arrayContaining([
        'one',
        'two',
        'three',
      ]));
    });
  });

  describe('error handling', () => {
    it('throws an exception on http errors', async () => {
      const mockedGet = mocked(axios.get);
      // eslint-disable-next-line prefer-promise-reject-errors
      mockedGet.mockImplementation(() => Promise.reject({
        data: {},
        status: 404,
      }));

      await expect(fetchReviews('10.1101/2021.07.05.451181', 'https://biophysics.sciencecolab.org')).rejects.toThrow();
    });

    it('returns empty array if there are no hypothesis link in the docmap', async () => {
      const mockedGet = mocked(axios.get);
      // @ts-ignore
      mockedGet.mockImplementation(() => Promise.resolve({
        data: { steps: [] },
        status: 200,
      }));

      await expect(fetchReviews('10.1101/2021.07.05.451181', 'https://biophysics.sciencecolab.org')).rejects.toThrow();
    });
  });
});
