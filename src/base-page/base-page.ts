export const basePage = (pageContent: string): string =>
  `<html lang="en">
      <head>
        <title>Enhanced Preprints</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Noto+Serif" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link rel="stylesheet" href="/styles.css"/>
      </head>
      <body>
        <div class="grid-container">
          <div class="banner"></div>
          ${pageContent}
        </div>
    </body>
  </html>`;
