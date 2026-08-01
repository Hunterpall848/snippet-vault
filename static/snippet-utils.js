export async function getSnipJson() { 
    const response = await fetch("/api/snippets");
    return await response.json();
    
}

function presentLanguages(allsnips) {
    const languages = new Set([]); 
    allsnips.forEach ((snip) => {
        languages.add(snip.language);
    });
    return languages;
};

export async function snippetList(allSnips) {
    const snippetElementDiv = document.querySelector("#snippet-button-list");
    const allLanguages = presentLanguages(allSnips);

    allLanguages.forEach ((lang) => {
        const languageSection = document.createElement("section");
        const languageHeading = document.createElement("h5");
        languageHeading.textContent = lang;
        languageSection.appendChild(languageHeading);

        allSnips.forEach ((snip) => {
            if (snip.language === lang) {
                const buttonElement = document.createElement("button");
                
                buttonElement.type = "button";
                buttonElement.textContent = snip.title;
                //need custom data on the button to locate correct snippet on click
                buttonElement.dataset.snippetId = snip.snippet_id;        
                languageSection.appendChild(buttonElement);
                
            };
        });
        snippetElementDiv.appendChild(languageSection);
    });
    return snippetElementDiv;
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
