CREATE TABLE articles (
    doi TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    authors TEXT NOT NULL,
    abstract TEXT NOT NULL,
    licenses TEXT NOT NULL,
    sections TEXT NOT NULL,
    content TEXT NOT NULL
);
