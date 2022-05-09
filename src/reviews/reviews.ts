import { marked } from "marked";
import { EnhancedArticle } from "../model/model";

export const generateReviewPage = (article: EnhancedArticle): string => `<main role="main">
<a class="return-link" href="/article/${article.doi}">< Back to article</a>
<ul class="review-list">
    ${article.reviews.map(review => `<li class="review-list__item"><article class="review-list-content">${marked.parse(review.text)}</article></li>`)}
</ul>
</main>`;
