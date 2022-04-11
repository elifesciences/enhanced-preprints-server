import { marked } from "marked";

export const generateReviewPage = (reviews: string[], doi: string): string => {
  const reviewListItems = reviews.map(review => `<li class="review-list__item"><article class="review-list-content">${marked.parse(review)}</article></li>`)
  return wrapWithHtml(reviewListItems.join(''), doi);
}

const wrapWithHtml = (reviews: string, doi: string) => `
<html lang="en">
  <head>
    <title>Reviews</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://unpkg.com/@stencila/thema@2/dist/themes/elife/styles.css" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css"/>
    <link href="https://api.fonts.coollabs.io/css2?family=Noto+Sans" rel="stylesheet"/>
    <link href="https://api.fonts.coollabs.io/css2?family=Noto+Serif" rel="stylesheet"/>
  </head>
  <body>
    <main role="main">
        <a class="return-link" href="/article/${doi}">< Back to article</a>
        <ul class="review-list">
            ${reviews}
        </ul>
    </main>
</body>
</html>
`
