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
  const summaryAuthorCount = 10;
  const summaryInstitutionCount = 3;
  const summaryAuthors: Array<Author> = [];
  let summaryAuthorsHtml = '';
  if (article.authors.length > summaryAuthorCount) {
    summaryAuthors.push(...article.authors.slice(0, summaryAuthorCount - 1));
    summaryAuthors.push(...article.authors.slice(-1));
    summaryAuthorsHtml += `<span class="content-header__authors--summary-count">show ${Math.max(article.authors.length - summaryAuthorCount, 0)} more</span>`;
  } else {
    summaryAuthors.push(...article.authors);
  }

  const summaryOrganisations: Array<string> = [];
  let summaryOrganisationsHtml = '';
  if (uniqueOrganisationListItems.length > summaryInstitutionCount) {
    summaryOrganisations.push(...uniqueOrganisationListItems.slice(0, summaryInstitutionCount));
    summaryOrganisationsHtml += `<span class="content-header__affiliations--summary-count">show ${Math.max(uniqueOrganisationListItems.length - summaryInstitutionCount, 0)} more</span>`;
  } else {
    summaryOrganisations.push(...uniqueOrganisationListItems);
  }

  return `<div class="content-header">
    ${generateFlags(['Medicine', 'Neuroscience', 'Cell Biology'], 'Landmark', 'Tour-de-force')}
    <h1 class="content-header__title">${contentToHtml(article.title)}</h1>
    <details class="content-header__authors"${article.authors.length <= summaryAuthorCount ? 'open' : ''}>
      <summary class="content-header__authors--summary">
        <ol class="content-header__authors--list">${summaryAuthors.map((author) => `<li class="person">${formatAuthorName(author)}</li>`).join('')} </ol>
        ${summaryAuthorsHtml}
      </summary>
      <ol class="content-header__authors--list">
        ${article.authors.map((author) => `<li class="person">${formatAuthorName(author)}</li>`).join('')}
      </ol>
    </details>
    <details class="content-header__affiliations"${uniqueOrganisationListItems.length <= summaryInstitutionCount ? 'open' : ''}>
      <summary class="content-header__affiliations--summary">
        <ol class="content-header__affiliations--list">${summaryOrganisations.join('')} </ol>
        ${summaryOrganisationsHtml}
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
