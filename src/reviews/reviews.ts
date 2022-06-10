import { marked } from 'marked';
import { EnhancedArticle } from '../model/model';

const wrapWithHtml = (reviews: string, doi: string): string => `<main class="reviews-page" role="main">
    <a class="return-link" href="/article/${doi}">< Back to article</a>
    <ul class="review-list">
        ${reviews}
    </ul>
  </main>`;

export const generateReviewPage = (article: EnhancedArticle): string => {
  if (article.reviews.length === 0) {
    return wrapWithHtml('<li class="review-list__item"><article class="review-list-content">No reviews found</article></li>', article.doi);
  }
  const reviewListItems = article.reviews.map((review) => `<li class="review-list__item"><article class="review-list-content">${marked.parse(review.text)}</article></li>`);
  return wrapWithHtml(reviewListItems.join(''), article.doi);
};
