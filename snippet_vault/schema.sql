DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS snippets;

CREATE TABLE user(
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE snippets(
    snippet_id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    language TEXT NOT NULL,
    prefix TEXT,
    body TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (author_id) REFERENCES user (id)
);
