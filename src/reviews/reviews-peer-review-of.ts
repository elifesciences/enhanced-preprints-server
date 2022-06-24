import { EnhancedArticle } from '../model/model';

export const reviewsOf = (article: EnhancedArticle, noHeader: boolean) => `<div class="review-of">
    <h2 class="review-of__heading">Peer review of:</h2>
    <a class="review-of__article_link" href="/article/${article.doi}${noHeader ? '?noHeader=true' : ''}">${article.title}</a>
</div>`;
