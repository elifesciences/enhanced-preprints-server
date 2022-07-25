import { contentToHtml } from '../model/content';
import { EnhancedArticle } from '../model/model';

export const reviewsOf = (article: EnhancedArticle, noHeader: boolean) => `<div class="review-of">
    <h2 class="review-of__heading">Peer review of:</h2>
    <a class="review-of__article_link" href="/article/${article.doi}${noHeader ? '?noHeader=true' : ''}">${contentToHtml(article.title)}</a>
    <ol class="review-of__authors">
        <li class="review-of__author">Louis K Scheffer</li>
        <li class="review-of__author">C Shan Xu</li>
        <li class="review-of__author">Stephen M Plaza</li>
    </ol>
</div>`;
