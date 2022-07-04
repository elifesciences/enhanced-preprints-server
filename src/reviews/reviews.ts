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
          <div class="article-review-status">
            <h1 class="article-review-status__heading">Peer reviewed by eLife</h1>
            <span class="article-review-status__text">
              This research was submitted to eLife and sent for consultative peer review. Reviewers and eLife's editors
              consulted to provide a summary following individual anonymous reviews. Authors have not yet chosen to
              revise and resubmit their paper, but have provided a response to the reviews.
            </span>
            <div class="article-review-status-timeline">
              <ol class="article-review-status-timeline__list">
                <li class="article-review-status-timeline__list_item"><span class="article-review-status-timeline__event">Author response</span><span class="article-review-status-timeline__date">Mar 6, 2022</span></li>
                <li class="article-review-status-timeline__list_item"><span class="article-review-status-timeline__event">Peer review</span><span class="article-review-status-timeline__date">Mar 3, 2022</span></li>
                <li class="article-review-status-timeline__list_item"><span class="article-review-status-timeline__event">Preprint posted</span><span class="article-review-status-timeline__date">Nov 8, 2021</span></li>
              </ol>
            </div>
            <a class="article-review-link" href="#">
              <span class="material-icons link-icon">arrow_forward</span>
              Read about eLife’s peer review process
            </a>
          </div>
          <div class="article-review-summary">
            <h2>Summary</h2>
            <p>
              This is a landmark paper and a tour-de-force that ties together decades of advances in electron microscopy to produce a dataset of both breadth and extreme technical quality whose very existence will have profound and lasting influence on neuroscience. The manuscript is extensive and well-illustrated, and the data, methods and analyses are made available to the community in an exemplary manner. The work represents ambitious, large-scale biological resource generation at its apotheosis.
            </p>

            <h3>Importance of claim</h3>
            <ol class="summary-badge-list">
              <li class="summary-badge-list__item">Landmark</li>
              <li class="summary-badge-list__item">Fundamental</li>
              <li class="summary-badge-list__item">Important</li>
              <li class="summary-badge-list__item">Noteworthy</li>
              <li class="summary-badge-list__item">Useful</li>
              <li class="summary-badge-list__item">Flawed</li>
            </ol>
            <p>
              The insights (if true) will substantially change the way we think about an important topic - or have wide reaching practical implications. Important idea that everybody in the field should know about.
            </p>

            <h3>Strength of evidence</h3>
            <ol class="summary-badge-list">
              <li class="summary-badge-list__item">Tour-de-force</li>
              <li class="summary-badge-list__item">Compelling</li>
              <li class="summary-badge-list__item">Convincing</li>
              <li class="summary-badge-list__item">Solid</li>
              <li class="summary-badge-list__item">Incomplete</li>
              <li class="summary-badge-list__item">Inadequate</li>
            </ol>
            <p>
              The quality of the dataset and / or analysis by far exceeds the current state of the art in the field. A major tour-de-force that sets new standards for years to come.
            </p>
          </div>
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
