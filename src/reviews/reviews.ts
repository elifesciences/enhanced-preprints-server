import { marked } from 'marked';
import { EnhancedArticle } from '../model/model';

const wrapWithHtml = (reviews: string, doi: string, noHeader: boolean): string => `<main class="reviews-page" role="main">
    <a class="return-button" href="/article/${doi}${noHeader ? '?noHeader=true' : ''}"><span class="material-icons return-button__icon">chevron_left</span>Back to article</a>
    <ul class="review-list">
        ${reviews}
    </ul>
  </main>`;

export const generateReviewPage = (article: EnhancedArticle, noHeader: boolean): string => {
  if (article.reviews.length === 0) {
    return wrapWithHtml('<li class="review-list__item"><article class="review-list-content">No reviews found</article></li>', article.doi, noHeader);
  }
  const reviewListItems = article.reviews.map((review) => `<li class="review-list__item"><article class="review-list-content">${marked.parse(review.text)}</article></li>`);
  return wrapWithHtml(reviewListItems.join(''), article.doi, noHeader);
};
