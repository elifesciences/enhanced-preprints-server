CREATE TABLE articles (
    doi TEXT NOT NULL PRIMARY KEY,
    xml TEXT NOT NULL,
    html TEXT NOT NULL,
    json TEXT NOT NULL,
    title TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.title')) STORED,
    date TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.datePublished.value')) STORED
);
