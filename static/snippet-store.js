/*  owns all snippet data and indexpositions
 *  manages the state change of snippets and changes made to snippets through APIs
 */
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
        this.allSnips = await response.json();
        return this.allSnips;
    };

    async deleteSnip() {
        const snippet = this.getCurrentSnippet() 

        let currentId = snippet.snippet_id;
        let currentTitle = snippet.title;

        const deleteWindowMessage = `
        Delete snippet: ${currentTitle}?

        This action cannot be undone.`;

        const userDeleteConfirmation = confirm(deleteWindowMessage);
        if (!userDeleteConfirmation) {
            return;
        };

        const response = await fetch(`/api/edit-snippets/${currentId}?snippet_id=${currentId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.log("Delete failed.");
            return;
        };

        snippet = null;
        editForm.hidden = true;
        return;
    };

    async submitSnip(event, endpoint, formName, method) {
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

    getCurrentSnippet() {
        if (!this.snipIndexPosition) {
            return;
        };
        return this.allSnips[this.snipIndexPosition]
    };

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
        const indexIsValid =
                Number.isInteger(newIndex) &&
                newIndex >= 0 &&
                newIndex < this.allSnips.length;

            if (!indexIsValid) {
                return false;
            };

            this.snipIndexPosition = newIndex;
            return;
    };
};
