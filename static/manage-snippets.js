import {getSnipJson, snippetList, languageList, handleFormSubmit} from "./snippet-utils.js";
import {TextBehavior, keyMaps, specialMaps} from "./text-area.js"

const buttonNext = document.querySelector("#next");
const buttonPrev = document.querySelector("#prev");
const displayCard = document.querySelector("#display-card")
const emptyState = document.querySelector("#empty-state");
const languageElementDiv = document.querySelector("#language-button-list");
const snippetElementDiv = document.querySelector("#snippet-button-list")
const editSnippetButton = document.querySelector("#edit-snippet")
let formButton = document.querySelector("#form-submit-button")
const textArea = document.querySelector("#body");
const buttonDel = document.querySelector("#delete-button");
const editForm = document.querySelector("#edit-snip-form");
const closeEditform = document.querySelector("#close-edit")

const textbehavior = new TextBehavior(textArea, keyMaps, specialMaps)

class ViewSnippets {

    constructor(getSnipJson, snippetList, languageList) {
        this.getSnipJson = getSnipJson;
        this.snippetList = snippetList;
        this.languageList = languageList;
        this.allSnips = [];
        this.indexPosition = 0;
    }

    getCurrentSnippet() {
        return this.allSnips[this.indexPosition]
    }

    handleUrlParsing(allSnips) {
        const urlQueryValues = new URLSearchParams(window.location.search);
        const snippetIdParam = urlQueryValues.get("snippetid");
        const snippetIdFromUrl = snippetIdParam ? Number(snippetIdParam) : null;

        if (snippetIdFromUrl) {
            const matchingIndex = allSnips.findIndex((snip) => snip.snippet_id === snippetIdFromUrl);
            // this checks to make sure the indexposition points to an actual value in the db
            if (matchingIndex !== -1) {
                this.indexPosition = matchingIndex;
                return;
            };
            return;
        };
    };

    async initViewPage() {
        this.allSnips = await this.getSnipJson();

        if (this.allSnips.length == 0) {
            displayCard.hidden = true;
            emptyState.hidden = false;
            return;
        };

        this.handleUrlParsing(this.allSnips);
        this.languageList(this.allSnips)
        this.buildCard();
        return;
    };

    refactorSnippetJson() {
        let defaultSnippet = this.getCurrentSnippet();
        let snippetTitle = defaultSnippet.title;
        let snippetBody = {
            prefix: defaultSnippet.prefix,
            body: defaultSnippet.body
        };
        let formatedSnippet = {[snippetTitle]: snippetBody};
        return formatedSnippet;
    };

    buildCard() {
        let currentSnip = this.getCurrentSnippet();
        let currentSnipJson = this.refactorSnippetJson();

        const title = document.querySelector("#display-title");
        const prefix = document.querySelector("#display-prefix")
        const body = document.querySelector("#display-body");

        title.textContent = currentSnip.title;
        prefix.textContent = currentSnip.prefix;
        body.textContent = JSON.stringify(currentSnipJson, null, 2);

        displayCard.hidden = false;
    }

    updateSnippets(freshSnips, snippetId = null) {
        this.allSnips = freshSnips;

        languageElementDiv.replaceChildren()
        snippetElementDiv.replaceChildren()
        this.languageList(this.allSnips)

        if (this.allSnips.length == 0) {
            displayCard.hidden = true;
            emptyState.hidden = false;
            return;
        };

        if (snippetId) {
            let matchingIndex = this.allSnips.findIndex((snip) => {
                return snip.snippet_id === snippetId;
            });

            if (matchingIndex !== -1) {
                this.indexPosition = matchingIndex;
            };
        };

        if (this.indexPosition > this.allSnips.length - 1) {
            this.indexPosition = this.allSnips.length - 1;
        };

        emptyState.hidden = true;
        this.buildCard();
    }
}

class EditDatabase {

    constructor(getSnipJson) {
        this.getSnipJson = getSnipJson;
        this.editingSnip = null;
    }

    async getSnippetData(snippetId) {
        const response = await fetch(`/api/edit-snippets/${snippetId}`);
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

        const response = await fetch(`/api/edit-snippets/${currentId}?snippet_id=${currentId}`, {
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
        return await this.getSnipJson();
    };
};

const viewSnippets = new ViewSnippets(getSnipJson, snippetList, languageList);
const editDatabase = new EditDatabase(getSnipJson);

if (buttonNext) {
    buttonNext.addEventListener("click", function() {
        const lastSnippetIndex = viewSnippets.allSnips.length - 1
        if (viewSnippets.indexPosition == lastSnippetIndex) {
            return;
        }
        viewSnippets.indexPosition++;
        viewSnippets.buildCard();
    })
}

if (buttonPrev) {
    buttonPrev.addEventListener("click", function() {
        if (viewSnippets.indexPosition == 0) {
            return;
        }
        viewSnippets.indexPosition--;
        viewSnippets.buildCard();
    })
}

if (languageElementDiv) {
    languageElementDiv.addEventListener("click", (langClickEvent) => {
        let clickedLangButton = langClickEvent.target.closest("button");

        if (clickedLangButton) {
            let clickedLanguage = clickedLangButton.dataset.language;
            snippetElementDiv.replaceChildren()
            viewSnippets.snippetList(viewSnippets.allSnips, clickedLanguage);
            return;
        };
        return;
    });

    snippetElementDiv.addEventListener("click", (snipClickEvent) => {
        let clickedSnipButton = snipClickEvent.target.closest("button");
        let snippetId = Number(clickedSnipButton.dataset.snippetId);

        //returns the index of the index where snip.snippet_id and snippetId are a match
        let matchingSnippet = viewSnippets.allSnips.findIndex((snip) => {
            return snip.snippet_id === snippetId;
        });

        viewSnippets.indexPosition = matchingSnippet
        viewSnippets.buildCard()
    });
};

editSnippetButton.addEventListener("click", async ()=> {
    let currentSnippet = viewSnippets.getCurrentSnippet();
    let editingSnippet = await editDatabase.getSnippetData(currentSnippet.snippet_id);
    editDatabase.loadSnippetIntoForm(editingSnippet);
});

if (buttonDel) {
    buttonDel.addEventListener("click", async() => {
        let freshSnips = await editDatabase.deleteSnippet();

        if (!freshSnips) {
            return;
        }

        viewSnippets.updateSnippets(freshSnips);
    })
}

//must initialize eventlistener on textarea form section
textbehavior.init()

formButton.addEventListener("click", async(event) => {
    event.preventDefault()
    let editedSnipId = editDatabase.editingSnip.snippet_id
    let freshSnips = await handleFormSubmit(
        event,
        `/api/edit-snippets/${editedSnipId}`,
        "#edit-snip-form",
        "PATCH"
    );

    if (!freshSnips) {
        return;
    }

    editForm.hidden = true
    viewSnippets.updateSnippets(freshSnips, editedSnipId);
})

closeEditform.addEventListener("click", () => {
    editForm.hidden = true;
});

viewSnippets.initViewPage();
