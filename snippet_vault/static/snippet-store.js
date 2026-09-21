/**  owns all snippet data and indexpositions
 *  manages the state change of snippets and changes made to snippets through APIs
 */
export class SnippetStore {

    constructor() {
        this.allSnips = [];
        this.currentSnipId = null;
        this.snipUrlPrefix = "/snips"
    };

    async refreshSnips() {
        const response = await fetch(`${this.snipUrlPrefix}/snippets`);
        if (!response) {
            return;
        };
        this.allSnips = await response.json();
        return this.allSnips;
    };

    async deleteSnip() {
        let snippet = this.getCurrentSnippet() 

        let currentId = snippet.snippet_id;
        let currentTitle = snippet.title;

        const deleteWindowMessage = `
        Delete snippet: ${currentTitle}?

        This action cannot be undone.`;

        const userDeleteConfirmation = confirm(deleteWindowMessage);
        if (!userDeleteConfirmation) {
            return;
        };

        const response = await fetch(`${this.snipUrlPrefix}/edit-snippets/${currentId}?snippet_id=${currentId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.log("Delete failed.");
            return;
        };

        snippet = null;
        return;
    };

    /** @param {Object} formPayload - structured snippet formdata.*/
    async submitSnip(event, endpoint, method, formPayload) {

        event.preventDefault();

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(formPayload),
        });
        if (!response.ok) {
            console.log("Save failed.");
            return false;
        };

        console.log("Save Success.");
        return true;
    };

    getCurrentSnippet() {
        //needed to verify if a snippet should be loaded or a default state
        if (this.currentSnipId === null) {
            return;
        };

        const currentSnippet = this.allSnips.find((snips) => {
            return this.currentSnipId === snips.snippet_id;
        });

        if (currentSnippet === undefined) {
            return console.log('=> Error finding valid snippet match');
        };
        return currentSnippet;
    };

    updateActiveId(snippetId) {
        const idIsValid =
                Number.isInteger(snippetId) &&
                snippetId >= 0 &&
                this.allSnips.some((snippet) => {
                    return snippet.snippet_id === snippetId;
                });

            if (idIsValid === false) {
                return false;
            };

            this.currentSnipId = snippetId;
            return;
    };

    getIndex(snipId) {
        const currentIndex = this.allSnips.findIndex((snippet) => {
            return snippet.snippet_id === snipId;
        });
        return currentIndex;
    };

    async presentLanguages() {
        const allSnips = await this.refreshSnips()
        const languages = new Set([]); 
        allSnips.forEach ((snip) => {
            languages.add(snip.language);
        });
        return languages;
    };
};
