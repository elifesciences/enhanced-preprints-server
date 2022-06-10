CREATE TABLE articles (
    doi TEXT NOT NULL PRIMARY KEY,
    xml TEXT NOT NULL,
    html TEXT NOT NULL,
    json TEXT NOT NULL,
    title TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.title')) VIRTUAL,
    date TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.datePublished.value')) VIRTUAL
);
