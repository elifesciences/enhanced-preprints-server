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

  // get summary lists
  const summaryAuthors: Array<Author> = [];
  if (article.authors.length >= 3) {
    summaryAuthors.push(...article.authors.slice(0, 2));
    summaryAuthors.push(...article.authors.slice(-1));
  } else {
    summaryAuthors.push(...article.authors);
  }

  const summaryOrganisations: Array<string> = [];
  if (article.authors.length > 2) {
    summaryOrganisations.push(...uniqueOrganisationListItems.slice(0, 2));
  } else {
    summaryOrganisations.push(...uniqueOrganisationListItems);
  }

  return `<div class="content-header">
    ${generateFlags(['Medicine', 'Neuroscience', 'Cell Biology'], 'Landmark', 'Tour-de-force')}
    <h1 class="content-header__title">${contentToHtml(article.title)}</h1>
    <details class="content-header__authors"${article.authors.length <= 3 ? 'open' : ''}>
      <summary class="content-header__authors--summary">
        <ol class="content-header__authors--list">${summaryAuthors.map((author) => `<li class="person">${formatAuthorName(author)}</li>`).join('')} </ol>
        <span class="content-header__authors--summary-count">+ ${article.authors.length - 3} more</span>
      </summary>
      <ol class="content-header__authors--list">
        ${article.authors.map((author) => `<li class="person">${formatAuthorName(author)}</li>`).join('')}
      </ol>
    </details>
    <details class="content-header__affiliations"${uniqueOrganisationListItems.length <= 3 ? 'open' : ''}>
      <summary class="content-header__affiliations--summary">
        <ol class="content-header__affiliations--list">${summaryOrganisations.join('')} </ol>
        <span class="content-header__affiliations--summary-count">+ ${uniqueOrganisationListItems.length - 2} more</span>
      </summary>
      <ol class="content-header__affiliations--list">
        ${uniqueOrganisationListItems.join('')}
      </ol>
    </details>
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
