CREATE TABLE articles (
    doi TEXT NOT NULL PRIMARY KEY,
    xml TEXT NOT NULL,
    html TEXT NOT NULL,
    document TEXT NOT NULL,
    title TEXT NOT NULL GENERATED ALWAYS AS (json_extract(document, '$.title')) VIRTUAL,
    date TEXT NOT NULL GENERATED ALWAYS AS (json_extract(document, '$.datePublished.value')) VIRTUAL,
    authors TEXT NOT NULL GENERATED ALWAYS AS (json_extract(document, '$.authors')) VIRTUAL,
    abstract TEXT NOT NULL GENERATED ALWAYS AS (json_extract(document, '$.description')) VIRTUAL,
    licenses TEXT NOT NULL GENERATED ALWAYS AS (json_extract(document, '$.licenses')) VIRTUAL,
    content TEXT NOT NULL GENERATED ALWAYS AS (json_extract(document, '$.content')) VIRTUAL
);
