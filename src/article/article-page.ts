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
      <div id="openseadragon1" style="width: 640px; height: 480px;"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/3.1.0/openseadragon.min.js"></script>
      <script type="text/javascript">
        var viewer = OpenSeadragon({
            id: "openseadragon1",
            preserveViewport: true,
            visibilityRatio:    1,
            minZoomLevel:       1,
            defaultZoomLevel:   1,
            sequenceMode:       true,
            prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/3.1.0/images/',
            tileSources: [
              'http://localhost:8182/iiif/2/test.jpg/info.json'
            ]
        });
      </script>
      ${evaluationSummary(article.doi)}
      ${article.html}
    </div>
  </div>
</main>

<div class="secondary-column">
  ${articleDetails(article.doi, noHeader)}
</div>`;
