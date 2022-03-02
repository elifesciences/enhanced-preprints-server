export const wrapArticleInHtml = (articleHTML: string, title: string): string => `
<html lang="en">
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://unpkg.com/@stencila/thema@2/dist/themes/elife/styles.css" rel="stylesheet">
    <script src="https://unpkg.com/@stencila/thema@2/dist/themes/elife/index.js"
      type="text/javascript"></script>
    <script
      src="https://unpkg.com/@stencila/components@&lt;=1/dist/stencila-components/stencila-components.esm.js"
      type="module"></script>
    <script
      src="https://unpkg.com/@stencila/components@&lt;=1/dist/stencila-components/stencila-components.js"
      type="text/javascript" nomodule=""></script>
  </head>
  <body>
    <main role="main">
        ${articleHTML}
    </main>
</body>
</html>
`;
