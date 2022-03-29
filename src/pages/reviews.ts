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
    <style>
      .review-list {
        list-style: none;
        margin: 2rem;
        padding: 0;
        font-family: Noto Sans,Arial,Helvetica,sans-serif;
      }
      .review-list__item {
        padding-top: 2rem;
        border-bottom: 1px solid black;
      }
      .review-list__item:first-child {
        padding-top: 0;
      }
      .review-list__item:last-child {
        border-bottom: none;
      }
    </style>
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
