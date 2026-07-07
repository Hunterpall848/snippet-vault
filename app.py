import sqlite3
from flask import Flask
from routes.snippets_api import snippets
from routes.pages import pages

app = Flask(__name__)

app.register_blueprint(snippets)
app.register_blueprint(pages)

connection = sqlite3.connect("snippets_app.db")
cursor = connection.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS snippets (
        snippet_id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        language TEXT NOT NULL,
        prefix TEXT,
        body TEXT NOT NULL,
        description TEXT
    );
""")
connection.commit()
connection.close()
