from flask import Blueprint, jsonify, render_template, request

from .db import get_db
from .langs import languages

bp = Blueprint("snippets",__name__, url_prefix="/snips")

@bp.get("/")
def index():
    return render_template("snips/snippet-creation.html", langs = languages)

@bp.get("/manage-snippets")
def manage_snippets():
    return render_template("snips/manage-snippets.html", langs = languages)

@bp.route("/snippet-creation", methods=["POST"])
def snippet_creation():
    new_snip = request.get_json()
    submitted_fields = set(new_snip)

    valid_fields = {"snippet_id","title", "language", "prefix", "body", "description"}
    required_fields = {"title", "prefix", "language", "body"}

    #using sets for form validation
    missing_fields = required_fields - submitted_fields
    if missing_fields:
        return ("Missing required fields.", 400)
    invalid_fields = submitted_fields - valid_fields
    if invalid_fields:
        return ("Invalid field detected", 400)
    for field in required_fields:
        if not new_snip[field].strip():
            return "Required field cannot be blank.", 400

    write_snippet_to_db(new_snip)
    return jsonify(new_snip), 201

@bp.route("/edit-snippets/<int:snippet_id>", methods=["GET","DELETE","PATCH"])
def edit_snippets(snippet_id):
    if request.method == "GET":
        editing_snip = read_snip_db(snippet_id)
        return jsonify(editing_snip)

    if request.method == "PATCH":
        updated_snip = request.get_json()
        return update_snippet(updated_snip, snippet_id) 

    return delete_snippet_from_db()

@bp.get("/snippets")
def snip_api():
    raw_snip_data = read_snip_db()
    return jsonify(raw_snip_data)

def delete_snippet_from_db():
    snippet_id = request.args.get("snippet_id")

    if snippet_id:
        db = get_db()
        db.execute("DELETE FROM snippets WHERE snippet_id = ?",
            (snippet_id,)
        )
        db.commit()

        return "Snippet deleted.", 204
    return "Snippet_id not detected.", 400


def write_snippet_to_db(snip):
    db = get_db()
    db.execute("""
        INSERT INTO snippets (
            title,
            language,
            prefix,
            body,
            description
        )    
        VALUES(?, ?, ?, ?, ?)
    """, ( 
          snip["title"],
          snip["language"],
          snip["prefix"],
          snip["body"],
          snip["description"]
    ))
    db.commit()


def read_snip_db(snippet_id=None):
    """ snippet_id => optional; allows querying for a single snip
    """
    db = get_db()
    all_rows = db.execute("""
        SELECT *
        FROM snippets
    """)

    if snippet_id:
        matching_snippet = next(
            (
                current_snippet
                for current_snippet in all_rows
                if current_snippet["snippet_id"] == snippet_id
            ),
            None
        )

        if matching_snippet:
            return dict(matching_snippet)
        return None

    return [dict(row) for row in all_rows]


def update_snippet(snip, snippet_id):
    db = get_db()
    db.execute("""
    UPDATE snippets
    SET
        title = ?,
        language = ?,
        prefix = ?,
        body = ?,
        description = ?
    WHERE snippet_id = ?
    """, (
        snip["title"],
        snip["language"],
        snip["prefix"],
        snip["body"],
        snip["description"],
        snippet_id,
    ))

    return jsonify(snip)
