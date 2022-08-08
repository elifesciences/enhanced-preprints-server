export const generateFlags = (msas: string[], importance: string, strengthOfEvidence: string): string => `
<ol class="content-header__article_flags">
    ${msas.map((msa) => `
        <li class="article-flags__list_item">
            <a class="article-flags__link article-flags__link-msa">${msa}</a>
        </li>
    `).join('')}
    <li class="article-flags__list_item">
        <a class="article-flags__link">${importance}</a>
    </li>
    <li class="article-flags__list_item">
        <a class="article-flags__link">${strengthOfEvidence}</a>
    </li>
</ol>
`;
