from flask import Blueprint, render_template
from db_queries import read_snip_db
from langs import languages

pages = Blueprint("page_render", __name__)

@pages.get("/")
def home():
    return render_template("view-snippets.html")

@pages.get("/edit-snippets")
def load_edit_snippets():
    return render_template("edit-snippets.html")

@pages.get("/snippet-creation")
def snippet_creation():
    snip_dict = read_snip_db()
    return render_template("snippet-creation.html", snip_dict=snip_dict, langs = languages)
