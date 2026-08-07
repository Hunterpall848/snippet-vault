export class SnippetStore {
    
    constructor() {
        this.allSnips = [];
        this.snipIndexPosition = null; 
    };

    async refreshSnips() {
        const response = await fetch("/api/snippets");
        if (!response) {
            return;
        };
        return this.allSnips = await response.json();
    };

    getCurrentSnippet() {
        return this.allSnips[this.snipIndexPosition]
    }

    matchIndex(matcher=null) {
        if (matcher) {
            let matchingIndex = this.allSnips.findIndex((snip) => {
                return snip.snippet_id === matcher;
            });
            return matchingIndex;
        };
        return;
    };

    updateIndexPosition(newIndex) {
        // this checks to make sure the indexposition points to an actual value in the db
        if (newIndex !== -1) {
            this.snipIndexPosition = newIndex;
            return this.snipIndexPosition;
        };
        return console.log(`invalid index position detected: ${newIndex}`);
    };
};

export function presentLanguages(allSnips) {
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
    const snippetMenu = document.querySelector("#snippet-menu");
        //used to create an unorganized general snippet menu
        if (lang == null) {
            snips.forEach ((snip) => {
                const snippetOption = document.createElement("option");
                
                snippetOption.textContent = snip.title;
                snippetOption.value = snip.snippet_id;        

                ssnippetMenu.appendChild(snippetOption);
            });
            return snippetMenu;
        };

        snips.forEach ((snip) => {
            if (snip.language === lang) {
                const snippetOption = document.createElement("option");

                snippetOption.textContent = snip.title;
                snippetOption.value = snip.snippet_id

                snippetMenu.appendChild(snippetOption);
            };
        }); 
        return snippetMenu;
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
    return;
};
