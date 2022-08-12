import { Heading, ProcessedArticle } from '../model/model';
import { jumpToMenu } from './jump-menu';
import { header } from './header';
import { articleDetails } from './article-details';
import { evaluationSummary } from './article-evaluation-summary';
import { config } from '../config';

export const articlePage = (article: ProcessedArticle, noHeader: boolean): string => {
  const headings: Heading[] = [{ id: 'evaluation-summary', text: 'eLife review summary' }, { id: 'abstract', text: 'Abstract' }];
  headings.push(...article.headings);

  // if we have a configured IIIF server, replace image tags with openseadragon viewer
  const imageViewer = (!config.iiifServer) ? '' : `<script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/3.1.0/openseadragon.min.js"></script>
  <script>
    const images = document.querySelectorAll('.article-body img');
    images.forEach((image) => {
      var imageUrl = image.src.replace('/attachment/', '/iiif/');
      var openseadragonElement = document.createElement('div');
      openseadragonElement.style.width = '100%';
      openseadragonElement.style.height = '600px';


      var openseadragonViewer = OpenSeadragon({
        element: openseadragonElement,
        prefixUrl: '//openseadragon.github.io/openseadragon/images/',
        tileSources: imageUrl,
      });

      // allow the seadragon client to be scrolled past, but does disable scrolling to navigate
      openseadragonViewer.innerTracker.scrollHandler=false;

      image.parentElement.replaceChild(openseadragonElement, image);
    });
  </script>`;

  return `${header(article)}
  <main class="primary-column">
    <div class="table-contents">
      ${jumpToMenu(headings)}
    </div>
    <div class="main-content-area">
      <div class="article-body">
        ${evaluationSummary(article.doi)}
        ${article.html}
      </div>
    </div>
  </main>

  ${imageViewer}

  <div class="secondary-column">
    ${articleDetails(article.doi, noHeader)}
  </div>`;
};
