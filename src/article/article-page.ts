import { ProcessedArticle } from '../model/model';
import { jumpToMenu } from './jump-menu';
import { header } from './header';
import { articleDetails } from './article-details';
import { evaluationSummary } from './article-evaluation-summary';

export const articlePage = (article: ProcessedArticle, noHeader: boolean): string => `${header(article)}
<main class="primary-column">
  <div class="table-contents">
    ${jumpToMenu(article.headings)}
  </div>
  <div class="main-content-area">
    <div class="article-body">
      ${evaluationSummary(article.doi)}
      ${article.content}
    </div>
  </div>
</main>

<div class="secondary-column">
  ${articleDetails(article.doi, noHeader)}
</div>`;
