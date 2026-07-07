
export async function getSnipJson() { 
    const response = await fetch("/api/snippets");
    return await response.json();
    
}

export async function snippetList() {
    const snippetElementDiv = document.querySelector("#snippet-button-list");
    const allSnips = await getSnipJson()
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

export async function handleFormSubmit(event, endpoint) {
    //endpoint must be string path matching a flask route in app.py
    event.preventDefault();
    const form = document.querySelector("#new-snip-form")
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
        method: "POST",
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
    return await getSnipJson();
};
