# Snippet-Vault
Author - **Hunter Pallister**

### Development

To run the server in development mode, access the root directory and run:
```bash
flask --app snippet_vault run --debug
```

Access the server at your localhost:
```text
127.0.0.1:<PORT>
```

Snippet vault uses python's `sqlite3` for database queries and `Flask `for server routing / http request handling. Javascript handles the majority of the page behavior, as much of the interaction with the app happens live rather than through the server API.

CSS naming conventions should follow BEM standards.

---
### Function

Common snippet syntax (and that recognized here) follows the following syntactic structure:
```json
{
  "Title": {
    "prefix": "",
    "body": "",
    "description": ""
  }
}
```

The syntax rules are those commonly recognized by json:
```text
\ == \\
" == "\
<tab> == \t
<enter> == \n
```

The syntax rules recognized in code snippets:
###### ${i:placeholder}
Creates a placeholder for a ***variable*** snippet value. In snippet vault, highlight a text selection and press the ***newly visible button*** to create a placeholder. The placeholder number should increment relatively.

###### ${0} 
This tells the cursor where it should it's ***final place should be*** once all placeholders have been filled in when using a snippet in your code.

