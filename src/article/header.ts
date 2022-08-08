import { Author, Organisation, ProcessedArticle } from '../model/model';
import { contentToHtml } from '../model/content';
import { generateFlags } from './article-flags';

const formatAuthorName = (author: Author) => `${author.givenNames.join(' ')} ${author.familyNames.join('')}`;

const formatOrganisation = (organisation: Organisation) => `${organisation.name}<address class="organisation__address">${organisation.address?.addressCountry ?? ''}</address>`;

export const header = (article: ProcessedArticle): string => {
  const organisationList = article.authors.flatMap((author) => author.affiliations).filter((organisation) => !!organisation);
  const organisationListItems = organisationList.map((organisation: Organisation) => `<li class="organisation">${formatOrganisation(organisation)}</li>`);
  // unique org list
  const uniqueOrganisationListItems = [...new Set(organisationListItems)];

  return `<div class="content-header">
    ${generateFlags(['Medicine', 'Neuroscience', 'Cell Biology'], 'Landmark', 'Tour-de-force')}
    <h1 class="content-header__title">${contentToHtml(article.title)}</h1>
    <ol class="content-header__authors">
      ${article.authors.map((author) => `<li class="person">${formatAuthorName(author)}</li>`).join('')}
    </ol>
    <ol class="content-header__affiliations">
      ${uniqueOrganisationListItems.join('')}
    </ol>
    <div class="content-header__footer">
      <ul class="content-header__identifiers">
        <li class="content-header__identifier"><a href="https://doi.org/${article.doi}">https://doi.org/${article.doi}</a></li>
      </ul>
      <ul class="content-header__icons">
        <li>
          <a href="https://en.wikipedia.org/wiki/Open_access" class="content-header__icon content-header__icon--oa">
            <span class="visuallyhidden">Open access</span>
          </a>
        </li>
        <li>
          <a href="https://creativecommons.org/licenses/by/4.0/" class="content-header__icon content-header__icon--cc">
            <span class="visuallyhidden">Copyright information</span>
          </a>
        </li>
      </ul>
    </div>
  </div>`;
};
