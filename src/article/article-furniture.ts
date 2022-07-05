export const articleFurniture = (doi: string, noHeader: boolean) => `<div class="article-furniture">
            <div class="article-status">
              <h2 class="article-status__heading">Reviewed Preprint</h2>
              <p class="article-status__text">This preprint has been reviewed by eLife. Authors have responded but not yet submitted a revised edition</p>
              <ul class="article-actions">
                <li class="article-actions__list-item">
                    <a class="article-actions__button" href="#"><span class="material-icons article-actions__button_icon">download</span>Download</a>
                </li>
                    <a class="article-actions__button" href="#"><span class="material-icons article-actions__button_icon">format_quote</span>Cite</a>
                </li>
                    <a class="article-actions__button" href="#"><span class="material-icons article-actions__button_icon">notifications</span>Follow</a>
                </li>
                    <a class="article-actions__button" href="#"><span class="material-icons article-actions__button_icon">share</span>Share</a>
                </li>
              </ul>
          </div>
          <div class="review-timeline">
              <ol class="review-timeline__list">
                  <li class="review-timeline__list_item"><span class="review-timeline__event">Author response</span><span class="review-timeline__date">Mar 6, 2022</span></li>
                  <li class="review-timeline__list_item"><span class="review-timeline__event">Peer review</span><span class="review-timeline__date">Mar 3, 2022</span></li>
                  <li class="review-timeline__list_item"><span class="review-timeline__event">Preprint posted</span><span class="review-timeline__date">Nov 8, 2021</span></li>
              </ol>
              <a class="review-timeline__reviews_link" href="/article/${doi}/reviews${noHeader ? '?noHeader=true' : ''}"><span class="material-icons link-icon">arrow_forward</span>Read the peer-review by eLife</a>
          </div>
          <div class="article-metadata">
              <ul class="article-metrics">
                  <li class="article-metrics__item">1,467 views</li>
                  <li class="article-metrics__item">1 citation</li>
                  <li class="article-metrics__item">13 tweets</li>
              </ul>
          </div>
        </div>`;
