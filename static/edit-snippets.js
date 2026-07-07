
import {getSnipJson, snippetList, handleFormSubmit} from "./snippet-utils.js";

let formButton = document.querySelector("#form-submit-button")
const buttonDel = document.querySelector("#delete-button");
const snippetElementDiv = document.querySelector("#snippet-button-list");
const editForm = document.querySelector("#edit-snip-form");
const emptyState = document.querySelector("#empty-state");
let snippetIdFromButton = 0;

class EditDatabase {

    constructor(getSnipJson, snippetList) {
        this.getSnipJson = getSnipJson;
        this.snippetList = snippetList;
        this.allSnips = [];
        this.editingSnip = null;
    }

    async initPage() {
        this.allSnips = await this.getSnipJson();
        this.snippetList(this.allSnips);

        if (this.allSnips.length == 0) {
            editForm.hidden = true;
            emptyState.hidden = false;
            return;
        }
    }

    async getSnippetData(snippetIdFromButton) {
        const response = await fetch(`/edit-snippets/api${snippetIdFromButton}`);
        this.editingSnip = await response.json();
        return this.editingSnip;
    }

    loadSnippetIntoForm(editingSnippet) {
        const titleInput = document.querySelector("#title");
        const languageInput = document.querySelector("#language");
        const prefixInput = document.querySelector("#prefix");
        const bodyInput = document.querySelector("#body");
        const descriptionInput = document.querySelector("#description");

        titleInput.value = editingSnippet.title;
        languageInput.value = editingSnippet.language;
        prefixInput.value = editingSnippet.prefix;
        bodyInput.value = editingSnippet.body;
        descriptionInput.value = editingSnippet.description || "";
        editForm.hidden = false;
    }

    async deleteSnippet() {
        if (!this.editingSnip) {
            return;
        }

        let currentId = this.editingSnip.snippet_id;
        let currentTitle = this.editingSnip.title;
        let currentButtonElement = document.querySelector(`[data-snippet-id="${currentId}"]`);

        const deleteWindowMessage = `
        Delete snippet: ${currentTitle}?

        This action cannot be undone.`;

        const userDeleteConfirmation = confirm(deleteWindowMessage);
        if (!userDeleteConfirmation) {
            return;
        };

        const response = await fetch (`/edit-snippets/api${currentId}?snippet_id=${currentId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            console.log("Delete failed.");
            return;
        };

        if (currentButtonElement) {
            currentButtonElement.remove();
        };

        this.editingSnip = null;
        editForm.hidden = true;
        this.allSnips = await this.getSnipJson();

        if (this.allSnips.length == 0) {
            emptyState.hidden = false;
        }
    };
};

if (snippetElementDiv) {
    snippetElementDiv.addEventListener("click", async (clickEvent) => {
        const clickedButton = clickEvent.target.closest("button");
        if (!clickedButton) {
            return;
        }

        snippetIdFromButton = Number(clickedButton.dataset.snippetId);
        const editingSnippet = await editDatabase.getSnippetData(snippetIdFromButton);
        editDatabase.loadSnippetIntoForm(editingSnippet);
    });
}

const editDatabase = new EditDatabase(getSnipJson, snippetList);

if (buttonDel) {
    buttonDel.addEventListener("click", function() {
        editDatabase.deleteSnippet()
    })
}

formButton.addEventListener("click", async function(event) {
    event.preventDefault()
    let editedSnipId = editDatabase.editingSnip.snippet_id
    let freshSnips = await handleFormSubmit(
        event, 
        `/edit-snippets/api${editedSnipId}`, 
        "#edit-snip-form", 
        "PATCH"
    );

    // need to replace buttons w/ updated values
    editForm.hidden = true
    snippetElementDiv.replaceChildren()
    editDatabase.snippetList(freshSnips)
})

editDatabase.initPage();
