CREATE TABLE articles (
    doi TEXT NOT NULL PRIMARY KEY,
    xml TEXT NOT NULL,
    html TEXT NOT NULL,
    json TEXT NOT NULL,
    title TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.title')) VIRTUAL,
    date TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.datePublished.value')) VIRTUAL,
    authors TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.authors')) VIRTUAL,
    abstract TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.description')) VIRTUAL,
    licenses TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.licenses')) VIRTUAL,
    content TEXT NOT NULL GENERATED ALWAYS AS (json_extract(json, '$.content')) VIRTUAL
);
