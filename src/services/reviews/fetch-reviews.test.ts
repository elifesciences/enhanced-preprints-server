import axios from 'axios';
import { mocked } from 'jest-mock';
import { fetchReviews } from './fetch-reviews';
import { docmapMock, docmapMock2, reviewMocks } from '../../../test-utils/docmap-mock';
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
      if (url.includes('get-by-doi?preprint_doi=10.1101/2021.07.05.451181')) {
        response.data = docmapMock;
      } else if (url.includes('get-by-manuscript-id?manuscript_id=85111')) {
        response.data = docmapMock2;
      } else {
        response.data = reviewMocks[url];
      }
      return Promise.resolve(response);
    });

    it('extracts the correct participants for each action, maps roles to friendly and strips peer-reviewers', async () => {
      const peerReview = await fetchReviews('10.1101/2021.07.05.451181', 'test');
      expect(peerReview.evaluationSummary.participants).toStrictEqual(expect.arrayContaining([
        { name: 'Ronald L Calabrese', role: 'Senior Editor', institution: 'Emory University, United States' },
        { name: 'Noah J Cowan', role: 'Reviewing Editor', institution: 'Johns Hopkins University, United States' },
      ]));
      expect(peerReview.authorResponse?.participants).toStrictEqual([]);
      expect(peerReview.reviews.flatMap((review) => review.participants)).toStrictEqual([]);
    });

    it('extracts the correct dates for each action', async () => {
      const peerReview = await fetchReviews('10.1101/2021.07.05.451181', 'test');
      expect(peerReview.evaluationSummary.date.getTime()).toStrictEqual(new Date('2022-02-15T09:43:15.348Z').getTime());
      expect(peerReview.authorResponse?.date.getTime()).toStrictEqual(new Date('2022-02-15T11:24:05.730Z').getTime());
      expect(peerReview.reviews.map((review) => review.date.getTime())).toStrictEqual(expect.arrayContaining([
        new Date('2022-02-15T09:43:12.593Z').getTime(),
        new Date('2022-02-15T09:43:13.592Z').getTime(),
        new Date('2022-02-15T09:43:14.350Z').getTime(),
      ]));
    });

    it('fetches the evaluation text for each action with a sciety hypothesis content URL', async () => {
      const peerReview = await fetchReviews('10.1101/2021.07.05.451181', 'test');
      expect(peerReview.evaluationSummary.text).toStrictEqual('summary');
      expect(peerReview.authorResponse?.text).toStrictEqual('reply');
      expect(peerReview.reviews.map((review) => review.text)).toStrictEqual(expect.arrayContaining([
        'one',
        'two',
        'three',
      ]));
    });

    it('fetches the content for revised preprints by manuscript id', async () => {
      const revisedPeerReview = await fetchReviews('85111', 'test');

      expect(revisedPeerReview).toBeDefined();
    });

    it.failing('fetches the all the content for all preprint revisions', async () => {
      const revisedPeerReview = await fetchReviews('85111', 'test');

      expect(revisedPeerReview.evaluationSummary.text).toStrictEqual('revised-summary');
      expect(revisedPeerReview.authorResponse?.text).toStrictEqual('revised-reply');
      expect(revisedPeerReview.reviews.map((review) => review.text)).toStrictEqual(expect.arrayContaining([
        'revised-one',
        'revised-two',
      ]));

      expect(revisedPeerReview.evaluationSummary.text).not.toStrictEqual('summary');
      expect(revisedPeerReview.authorResponse?.text).not.toStrictEqual('reply');
      expect(revisedPeerReview.reviews.map((review) => review.text)).not.toStrictEqual(expect.arrayContaining([
        'review-one',
        'review-two',
        'review-three',
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
