import { marked } from 'marked';
import { EnhancedArticle } from '../model/model';

const wrapWithHtml = (reviews: string, doi: string, noHeader: boolean): string => `
  <div class="secondary-column">
    secondary column
  </div>
  <main class="primary-column">
        <div class="table-contents">
          <a class="return-button" href="/article/${doi}${noHeader ? '?noHeader=true' : ''}"><span class="material-icons return-button__icon">chevron_left</span>Back to article</a>
        </div>
        <div class="main-content-area">
          <ul class="review-list">
              ${reviews}
          </ul>
        </div>
      </main>`;

export const generateReviewPage = (article: EnhancedArticle, noHeader: boolean): string => {
  if (article.reviews.length === 0) {
    return wrapWithHtml('<li class="review-list__item"><article class="review-list-content">No reviews found</article></li>', article.doi, noHeader);
  }
  const reviewListItems = article.reviews.map((review) => `<li class="review-list__item"><article class="review-list-content">${marked.parse(review.text)}</article></li>`);
  return wrapWithHtml(reviewListItems.join(''), article.doi, noHeader);
};
