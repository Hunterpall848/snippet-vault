
export async function getSnipJson() { 
    const response = await fetch("/api/snippets");
    return await response.json();
    
}

export async function snippetList(allSnips) {
    const snippetElementDiv = document.querySelector("#snippet-button-list");
    allSnips.forEach((snippet) => {
        const buttonElement = document.createElement("button");
        
        buttonElement.type = "button";
        buttonElement.textContent = snippet.title;
        //need custom data on the button to locate correct snippet on click
        buttonElement.dataset.snippetId = snippet.snippet_id;        
        snippetElementDiv.appendChild(buttonElement);
        return snippetElementDiv;
    });
};

/** Submits a form to the backend
 *  @param {string} endpoint - must be a valid backend endpoint
 *  @param {string} formName - must be an html form element
*/
export async function handleFormSubmit(event, endpoint, formName, method) {
    event.preventDefault();
    const form = document.querySelector(formName)
    const formData = new FormData(form)

    const grabSnippetForm = {
        snippet_id: formData.get("snippet_id"),
        title: formData.get("title"),
        language: formData.get("language"),
        prefix: formData.get("prefix"),
        body: formData.get("body"),
        description: formData.get("description"),
    };

    const response = await fetch(endpoint, {
        method: method,
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(grabSnippetForm),
    });
    if (!response.ok) {
        console.log("Save failed.");
        return;
    };

    form.reset();
    console.log("Save Success.");
    return await getSnipJson();
};
