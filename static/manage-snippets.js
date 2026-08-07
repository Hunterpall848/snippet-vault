import {SnippetStore, snippetList, languageList, handleFormSubmit} from "./snippet-utils.js";
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
const initialState = document.querySelector("#initial-state")

const textbehavior = new TextBehavior(textArea, keyMaps, specialMaps)
const snippetStore = new SnippetStore()

class ViewSnippets {

    constructor(snippetStore, snippetList, languageList) {
        this.snippetStore = snippetStore;
        this.snippetList = snippetList;
        this.languageList = languageList;
    }

    handleUrlParsing() {
        const urlQueryValues = new URLSearchParams(window.location.search);
        const snippetIdParam = urlQueryValues.get("snippetid");
        const snippetIdFromUrl = snippetIdParam ? Number(snippetIdParam) : null;

        if (snippetIdFromUrl) {
            const matchingIndex = snippetStore.matchIndex(snippetIdFromUrl);

            this.snippetStore.updateIndexPosition(matchingIndex)
            //returns true so that the boolean can be evaluated if there was a URL ID
            return true;
        };
            return;
    };

    async initViewPage() {
        const allSnips = await this.snippetStore.refreshSnips()
        if (allSnips.length == 0) {
            displayCard.hidden = true;
            emptyState.hidden = false;
            return;
        };

        const validationCheck = this.handleUrlParsing()
        if (validationCheck) {
            this.buildCard()
            return;
        };

        initialState.hidden = false;
        displayCard.hidden = true;

        this.handleUrlParsing(allSnips);
        this.languageList(allSnips)
        return;
    };

    buildCard() {
        let currentSnip = this.snippetStore.getCurrentSnippet();
        let currentSnipJson = this.refactorSnippetJson();

        const title = document.querySelector("#display-title");
        const prefix = document.querySelector("#display-prefix")
        const body = document.querySelector("#display-body");

        title.textContent = currentSnip.title;
        prefix.textContent = currentSnip.prefix;
        body.textContent = JSON.stringify(currentSnipJson, null, 2);

        displayCard.hidden = false;
        initialState.hidden = true;
    }

    refactorSnippetJson() {
        let defaultSnippet = this.snippetStore.getCurrentSnippet();
        let snippetTitle = defaultSnippet.title;
        let snippetBody = {
            prefix: defaultSnippet.prefix,
            body: defaultSnippet.body
        };
        let formatedSnippet = {[snippetTitle]: snippetBody};
        return formatedSnippet;
    };

    async updatePage(snippetId) {
        const allSnips = await this.snippetStore.refreshSnips();
        const matchingIndex = this.snippetStore.matchIndex(snippetId)
        this.snippetStore.updateIndexPosition(matchingIndex)

        languageElementDiv.replaceChildren()
        snippetElementDiv.replaceChildren()
        this.languageList(allSnips)

        if (allSnips.length == 0) {
            displayCard.hidden = true;
            emptyState.hidden = false;
            return;
        };

        if (snippetStore.snipIndexPosition > snippetStore.allSnips.length - 1) {
            snippetStore.snipIndexPosition = snippetStore.allSnips.length - 1;
        };

        emptyState.hidden = true;
        this.buildCard();
    }
}

class EditDatabase {

    constructor() {
        this.snippetStore = snippetStore;
    }

    async updateEditForm() {
        let currentSnippet = this.snippetStore.getCurrentSnippet();
        editDatabase.loadSnippetIntoForm(currentSnippet);

        textbehavior.generatePreviewText()
    };

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
        let currentSnippet = this.snippetStore.getCurrentSnippet();

        let currentId = currentSnippet.snippet_id;
        let currentTitle = currentSnippet.title;
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

        currentSnippet = null;
        editForm.hidden = true;
        return;
    };
};


const viewSnippets = new ViewSnippets(snippetStore, snippetList, languageList);
const editDatabase = new EditDatabase(snippetStore);
viewSnippets.initViewPage();
//must initialize eventlistener on textarea form section
textbehavior.createEventListeners()

if (buttonNext) {
    buttonNext.addEventListener("click", function() {
        const lastSnippetIndex = snippetStore.allSnips.length - 1
        if (snippetStore.snipIndexPosition == lastSnippetIndex) {
            return;
        }
        snippetStore.snipIndexPosition++;
        viewSnippets.buildCard();
    })
}

if (buttonPrev) {
    buttonPrev.addEventListener("click", function() {
        if (snippetStore.snipIndexPosition == 0) {
            return;
        }
        snippetStore.snipIndexPosition--;
        viewSnippets.buildCard();
    })
}

if (languageElementDiv) {
    languageElementDiv.addEventListener("click", (langClickEvent) => {
        let clickedLangButton = langClickEvent.target.closest("button");

        if (clickedLangButton) {
            let clickedLanguage = clickedLangButton.dataset.language;
            snippetElementDiv.replaceChildren()
            viewSnippets.snippetList(snippetStore.allSnips, clickedLanguage);
            return;
        };
        return;
    });

    snippetElementDiv.addEventListener("click", (snipClickEvent) => {
        let clickedSnipButton = snipClickEvent.target.closest("button");
        let snippetId = Number(clickedSnipButton.dataset.snippetId);

        let matchingSnippet = snippetStore.matchIndex(snippetId)
        snippetStore.updateIndexPosition(matchingSnippet)

        viewSnippets.buildCard()
        editForm.hidden = true;
    });
};

editSnippetButton.addEventListener("click", async ()=> {
    editDatabase.updateEditForm();
});

if (buttonDel) {
    buttonDel.addEventListener("click", async() => {
        editDatabase.deleteSnippet();
        snippetStore.refreshSnips()

        viewSnippets.updatePage();
    })
}


formButton.addEventListener("click", async(event) => {
    event.preventDefault()
    let editedSnipId = snippetStore.getCurrentSnippet().snippet_id
    await handleFormSubmit(
        event,
        `/api/edit-snippets/${editedSnipId}`,
        "#edit-snip-form",
        "PATCH"
    );

    snippetStore.refreshSnips()

    editForm.hidden = true
    viewSnippets.updatePage(editedSnipId);
})

closeEditform.addEventListener("click", () => {
    editForm.hidden = true;
});

