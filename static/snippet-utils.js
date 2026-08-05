export async function getSnipJson() { 
    const response = await fetch("/api/snippets");
    return await response.json();
    
}

function presentLanguages(allSnips) {
    const languages = new Set([]); 
    allSnips.forEach ((snip) => {
        languages.add(snip.language);
    });
    return languages;
};

export async function languageList(allSnips) {
    const allLanguages = presentLanguages(allSnips);
    const languageElementDiv = document.querySelector("#language-button-list")

    allLanguages.forEach ((lang) => {
        const languageButton = document.createElement("button");
        languageButton.textContent = lang;
        languageButton.dataset.language = lang
        languageElementDiv.appendChild(languageButton);
    });
    return languageElementDiv;
};

export async function snippetList(snips = null, lang = null) {
    /* function requires one argument or the other, but can not take both; it will return undefined.
     * if neither is provided it will default to the first arg => snips.*/
    const snippetElementDiv = document.querySelector("#snippet-button-list");
        if (lang == null) {
            snips.forEach ((snip) => {
                const snippetButton = document.createElement("button");
                
                snippetButton.type = "button";
                snippetButton.textContent = snip.title;
                snippetButton.dataset.snippetId = snip.snippet_id;        
                snippetElementDiv.appendChild(snippetButton);
            });
            return snippetElementDiv;
        };
        snips.forEach ((snip) => {
            if (snip.language === lang) {
                const snippetButton = document.createElement("button");

                snippetButton.type = "button";
                snippetButton.textContent = snip.title;
                snippetButton.dataset.snippetId = snip.snippet_id;        
                snippetElementDiv.appendChild(snippetButton);
            };
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
