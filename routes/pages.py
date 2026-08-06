from flask import Blueprint, render_template
from db_queries import read_snip_db
from langs import languages

pages = Blueprint("page_render", __name__)

@pages.get("/")
def home():
    return render_template("manage-snippets.html", langs = languages)

@pages.get("/snippet-creation")
def snippet_creation():
    return render_template("snippet-creation.html", langs = languages)
