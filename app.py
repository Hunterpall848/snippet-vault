import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
connection = sqlite3.connect("snippets_app.db")
cursor = connection.cursor()

valid_fields = {"snippet_id","title", "language", "prefix", "body", "description"}
required_fields = {"title", "prefix", "language", "body"}

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


def delete_snippet_from_db():
    snippet_id = request.args.get("snippet_id")

    if snippet_id:
        connection = sqlite3.connect("snippets_app.db")
        cursor = connection.cursor()
        cursor.execute("DELETE FROM snippets WHERE snippet_id = ?",
            (snippet_id,)
        )
        connection.commit()
        connection.close()

        return "Snippet deleted.", 204
    return "Snippet_id not detected.", 400


def write_snippet_to_db(snip):
    connection = sqlite3.connect("snippets_app.db")
    cursor = connection.cursor()
    cursor.execute("""
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
    connection.commit()
    connection.close()


def read_snip_db(snippet_id=None):
    """ snippet_id => optional; allows querying for a single snip
    """
    connection = sqlite3.connect("snippets_app.db")
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute("""
        SELECT *
        FROM snippets
    """)
    all_rows = cursor.fetchall()

    if snippet_id:
        matching_snippet = next(
            (
                current_snippet
                for current_snippet in all_rows
                if current_snippet["snippet_id"] == snippet_id
            ),
            None
        )
        connection.close()

        if matching_snippet:
            return dict(matching_snippet)
        return None

    connection.close()
    return [dict(row) for row in all_rows]


def update_snippet(snip, snippet_id):
    connection = sqlite3.connect("snippets_app.db")
    cursor = connection.cursor()
    cursor.execute("""
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

    connection.commit()
    connection.close()

    return jsonify(snip)


@app.get("/")
def home():
    return render_template("index.html")


@app.route("/snippet-creation", methods=["GET","POST"])
def snippet_creation():
    if request.method == "POST":
        new_snip = request.get_json()
        submitted_fields = set(new_snip)
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

    snip_dict = read_snip_db()
    return render_template("snippet-creation.html", snip_dict=snip_dict)


@app.route("/view-snippets")
def saved_snippets():
    return render_template("view-snippets.html")

    
@app.get("/edit-snippets")
def load_edit_snippets():
    return render_template("edit-snippets.html")


@app.route("/edit-snippets/api<int:snippet_id>", methods=["GET","DELETE","PATCH"])
def edit_snippets(snippet_id):
    if request.method == "GET":
        editing_snip = read_snip_db(snippet_id)
        return jsonify(editing_snip)

    if request.method == "PATCH":
        updated_snip = request.get_json()
        return update_snippet(updated_snip, snippet_id) 

    return delete_snippet_from_db()


@app.get("/api/snippets")
def snippets_api():
    raw_snip_data = read_snip_db()
    return jsonify(raw_snip_data)

