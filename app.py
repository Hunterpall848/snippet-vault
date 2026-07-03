import sqlite3
from flask import Flask, render_template, request, jsonify


app = Flask(__name__)
connection = sqlite3.connect("snippets_app.db")
cursor = connection.cursor()


valid_fields = {"snippet_id","title", "language", "tags", "content", "notes"}
required_fields = {"title", "language", "content"}


cursor.execute("""
    CREATE TABLE IF NOT EXISTS snippets (
        snippet_id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        language TEXT NOT NULL,
        tags TEXT,
        content TEXT NOT NULL,
        notes TEXT
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
    #could add a delete all option

def write_snippet_to_db(snip):
    connection = sqlite3.connect("snippets_app.db")
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO snippets (
            title,
            language,
            tags,
            content,
            notes
        )    
        VALUES(?, ?, ?, ?, ?)
    """, ( 
          snip["title"],
          snip["language"],
          snip["tags"],
          snip["content"],
          snip["notes"]
    ))
    connection.commit()
    connection.close()


def read_snip_db():
    connection = sqlite3.connect("snippets_app.db")
    # configures the connection obj row_factory property to format
    # in a key : value format using Row property from sqlite3 obj
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute("""
        SELECT *
        FROM snippets
    """)
    all_rows = cursor.fetchall()
    connection.close()
    # returns a dictionary
    return [dict(row) for row in all_rows] 


@app.get("/")
def home():
    return render_template("index.html")


@app.route("/snippet-creation", methods=["GET","POST"])
def snippet_creation():
    if request.method == "POST":
        new_snip = request.get_json()
        submitted_fields = set(new_snip)

        # form validation to ensure consistent db format
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


@app.route("/saved-snippets", methods=["GET","DELETE"])
def saved_snippets():
    if request.method == "GET":
        snip_dict = read_snip_db()
        return render_template("saved-snippets.html", snip_dict=snip_dict)
    return delete_snippet_from_db()
    


@app.get("/api/snippets")
def get_snip_json():
    raw_snip_data = read_snip_db()
    return jsonify(raw_snip_data)
