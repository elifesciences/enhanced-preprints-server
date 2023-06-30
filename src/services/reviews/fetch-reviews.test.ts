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
      if (url.includes('?manuscript_id=')) {
        response.data = docmapMock;
      } else {
        response.data = reviewMocks[url];
      }
      return Promise.resolve(response);
    });

    let peerReviewv1: PeerReview;
    let peerReviewv2: PeerReview;
    beforeAll(async () => {
      peerReviewv1 = await fetchReviews('88888');
      peerReviewv2 = await fetchReviews('88888/v2');
    });

    it('extracts the correct participants for each action, maps roles to friendly and strips peer-reviewers (default version)', () => {
      expect(peerReviewv1.evaluationSummary.participants).toStrictEqual(expect.arrayContaining([
        { name: 'Ronald L Calabrese', role: 'Senior Editor', institution: 'Emory University, United States' },
        { name: 'Noah J Cowan', role: 'Reviewing Editor', institution: 'Johns Hopkins University, United States' },
      ]));
      expect(peerReviewv1.authorResponse?.participants).toStrictEqual([]);
      expect(peerReviewv1.reviews.flatMap((review) => review.participants)).toStrictEqual([]);
    });

    it('extracts the correct participants for each action, maps roles to friendly and strips peer-reviewers (specific version)', () => {
      expect(peerReviewv2.evaluationSummary.participants).toStrictEqual(expect.arrayContaining([
        { name: 'Ronald L Calabrese', role: 'Senior Editor', institution: 'Emory University, United States' },
        { name: 'Noah J Cowan', role: 'Reviewing Editor', institution: 'Johns Hopkins University, United States' },
      ]));
      expect(peerReviewv2.authorResponse?.participants).toStrictEqual([]);
      expect(peerReviewv2.reviews.flatMap((review) => review.participants)).toStrictEqual([]);
    });

    it('extracts the correct dates for each action (default version)', () => {
      expect(peerReviewv1.evaluationSummary.date.getTime()).toStrictEqual(new Date('2022-02-15T09:43:15.348Z').getTime());
      expect(peerReviewv1.authorResponse?.date.getTime()).toStrictEqual(new Date('2022-02-15T11:24:05.730Z').getTime());
      expect(peerReviewv1.reviews.map((review) => review.date.getTime())).toStrictEqual(expect.arrayContaining([
        new Date('2022-02-15T09:43:12.593Z').getTime(),
        new Date('2022-02-15T09:43:13.592Z').getTime(),
        new Date('2022-02-15T09:43:14.350Z').getTime(),
      ]));
    });

    it('extracts the correct dates for each action (specific version)', () => {
      expect(peerReviewv2.evaluationSummary.date.getTime()).toStrictEqual(new Date('2022-04-15T09:43:15.348Z').getTime());
      expect(peerReviewv2.authorResponse?.date.getTime()).toStrictEqual(new Date('2022-04-15T11:24:05.730Z').getTime());
      expect(peerReviewv2.reviews.map((review) => review.date.getTime())).toStrictEqual(expect.arrayContaining([
        new Date('2022-04-15T09:43:12.593Z').getTime(),
        new Date('2022-04-15T09:43:13.592Z').getTime(),
        new Date('2022-04-15T09:43:14.350Z').getTime(),
      ]));
    });

    it('fetches the evaluation text for each action with a sciety hypothesis content URL (default version)', () => {
      expect(peerReviewv1.evaluationSummary.text).toStrictEqual('summary');
      expect(peerReviewv1.authorResponse?.text).toStrictEqual('reply');
      expect(peerReviewv1.reviews.map((review) => review.text)).toStrictEqual(expect.arrayContaining([
        'one',
        'two',
        'three',
      ]));
    });

    it('fetches the evaluation text for each action with a sciety hypothesis content URL (specific version)', () => {
      expect(peerReviewv2.evaluationSummary.text).toStrictEqual('v2 summary');
      expect(peerReviewv2.authorResponse?.text).toStrictEqual('v2 reply');
      expect(peerReviewv2.reviews.map((review) => review.text)).toStrictEqual(expect.arrayContaining([
        'v2 one',
        'v2 two',
        'v2 three',
      ]));
    });
  });

  describe('error handling', () => {
    it('throws an exception if reviews not available for specified version', async () => {
      const mockedGet = mocked(axios.get);

      // @ts-ignore
      mockedGet.mockImplementation((url) => {
        const response = {
          data: {},
          status: 200,
        };
        if (url.includes('?manuscript_id=')) {
          response.data = docmapMock;
        } else {
          response.data = reviewMocks[url];
        }
        return Promise.resolve(response);
      });

      await expect(fetchReviews('88888/v3')).rejects.toThrow('Unable to retrieve reviews for article 88888 (version: 3, entries: 2)');
    });

    it('throws an exception on http errors', async () => {
      const mockedGet = mocked(axios.get);
      // eslint-disable-next-line prefer-promise-reject-errors
      mockedGet.mockImplementation(() => Promise.reject({
        data: {},
        status: 404,
      }));

      await expect(fetchReviews('88888')).rejects.toThrow();
    });

    it('returns empty array if there are no hypothesis link in the docmap', async () => {
      const mockedGet = mocked(axios.get);
      // @ts-ignore
      mockedGet.mockImplementation(() => Promise.resolve({
        data: { steps: [] },
        status: 200,
      }));

      await expect(fetchReviews('88888')).rejects.toThrow();
    });
  });
});
