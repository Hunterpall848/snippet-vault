from flask import Blueprint, request, jsonify
from db_queries import *

snippets = Blueprint("snippets_api",__name__, url_prefix="/api")

valid_fields = {"snippet_id","title", "language", "prefix", "body", "description"}
required_fields = {"title", "prefix", "language", "body"}

@snippets.route("/snippet-creation", methods=["POST"])
def snippet_creation():
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

@snippets.route("/edit-snippets/<int:snippet_id>", methods=["GET","DELETE","PATCH"])
def edit_snippets(snippet_id):
    if request.method == "GET":
        editing_snip = read_snip_db(snippet_id)
        return jsonify(editing_snip)

    if request.method == "PATCH":
        updated_snip = request.get_json()
        return update_snippet(updated_snip, snippet_id) 

    return delete_snippet_from_db()

@snippets.get("/snippets")
def snip_api():
    raw_snip_data = read_snip_db()
    return jsonify(raw_snip_data)
