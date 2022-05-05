export const basePage = (pageContent: string, title: string): string => `
<html lang="en">
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://unpkg.com/@stencila/thema@2/dist/themes/elife/styles.css" rel="stylesheet">
    <link href="https://api.fonts.coollabs.io/css2?family=Noto+Sans" rel="stylesheet"/>
    <link href="https://api.fonts.coollabs.io/css2?family=Noto+Serif" rel="stylesheet"/>
    <link rel="stylesheet" href="/styles.css"/>
  </head>
  <body>
    ${pageContent}
</body>
</html>
`;
