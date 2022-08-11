import { marked } from 'marked';
import { jumpToMenu } from '../article/jump-menu';
import { EnhancedArticle, Heading } from '../model/model';
import { editorsAndReviewers } from './reviews-editors-and-reviewers';
import { reviewsOf } from './reviews-peer-review-of';
import { reviewStatus } from './review-status';
import { reviewSummary } from './review-summary';

const wrapWithHtml = (editorsAndReviewersSection: string, reviews: string, article: EnhancedArticle, noHeader: boolean): string => {
  const headings: Heading[] = [
    { id: 'evaluation-summary', text: 'Evaluation summary' },
    { id: 'editors-and-reviewers', text: 'Editors and reviewers' },
  ];
  headings.push(...Array.from({ length: article.peerReview.reviews.length }, (value, key) => key).map<Heading>((review, index) => ({
    id: `review-${index + 1}`,
    text: `Review ${index + 1}`,
  })));

  if (article.peerReview.authorResponse) {
    headings.push({
      id: 'author-response',
      text: 'Author response',
    });
  }

  return `
  <div class="secondary-column">
    ${reviewsOf(article, noHeader)}
  </div>
  <main class="primary-column">
    <div class="table-contents">
      <a class="return-button" href="/article/${article.doi}${noHeader ? '?noHeader=true' : ''}"><span class="material-icons return-button__icon">chevron_left</span>Back to article</a>
      ${jumpToMenu(headings)}
    </div>
    <div class="main-content-area">
      ${reviewStatus}
      ${reviewSummary}
      ${editorsAndReviewersSection}
      <ul class="review-list">
          ${reviews}
      </ul>
    </div>
  </main>`;
};

export const generateReviewPage = (article: EnhancedArticle, noHeader: boolean): string => {
  if (article.peerReview.reviews.length === 0) {
    return wrapWithHtml(editorsAndReviewers(), '<li class="review-list__item"><article class="review-list-content">No reviews found</article></li>', article, noHeader);
  }

  const reviewListItems = article.peerReview.reviews.map((review, index) => `<li class="review-list__item"><article class="review-list-content" id="review-${index + 1}" data-jump-menu-target>${marked.parse(review.text)}</article></li>`);
  if (article.peerReview.authorResponse) {
    reviewListItems.push(`<li class="review-list__item"><article class="review-list-content" id="author-response" data-jump-menu-target>${marked.parse(article.peerReview.authorResponse.text)}</article></li>`);
  }

  return wrapWithHtml(editorsAndReviewers(), reviewListItems.join(''), article, noHeader);
};
