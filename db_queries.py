import sqlite3
from flask import request, jsonify

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
