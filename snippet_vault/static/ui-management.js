
export class ManageUi {

    /**
     * @param {SnippetStore} snippetStore - Stores snippet data and selection state.
     * @param {SnippetListRenderer} snippetListRenderer - Renders the snippet-selection lists.
     * @param {Object} elements - Container for all DOM elements used by this class.
     */
    constructor (snippetStore, snippetListRenderer, snipBodyEditor, elements) {
        this.snippetStore = snippetStore;
        this.snippetListRenderer = snippetListRenderer;
        this.snipBodyEditor = snipBodyEditor;
        this.elements = elements;
    };

    showCardState(state) {
        this.elements.initialState.hidden = state !== "initial";
        this.elements.emptyState.hidden = state !== "empty";
        this.elements.snippetView.hidden = state !== "snippet";
    };

    async initialPageState() {
        const allSnips = await this.snippetStore.refreshSnips()

        if (allSnips.length == 0) {
            this.showCardState("empty");
            return;
        };

        this.snippetListRenderer.createLanguageList(allSnips)
        const validationCheck = this.handleUrlParsing()

        if (validationCheck) {
            const currentSnip = this.snippetStore.getCurrentSnippet();
            this.displayCurrentSnip(currentSnip)
            return;
        };

        this.showCardState("initial");
        return;
    };
    
    /** @param {HTMLFormElement} form - queried html form element */
    grabFormData(formName) {
        const formData = new FormData(formName)

        const formPayload = {
            title: formData.get("title"),
            language: formData.get("language"),
            prefix: formData.get("prefix"),
            body: formData.get("body"),
            description: formData.get("description"),
        };

        return formPayload;
    };

    /**
     * reformats the snippet into  ideal snippet structure
     */
    reformatSnippet(currentSnip) {
        let snippetTitle = currentSnip.title;
        let snippetBody = {
            prefix: currentSnip.prefix,
            body: currentSnip.body,
            description: currentSnip.description
        };
        let formattedSnippet = {[snippetTitle]: snippetBody};
        return formattedSnippet;
    };
    
    /**
     * displays the selected snippet in the viewable snippet card area
     */
    displayCurrentSnip(currentSnip) {
        //makes sure each newline starts at the right place
        const bodyIndent = " ".repeat('    "body": "'.length);

        const formattedSnippet = this.reformatSnippet(currentSnip);
        const snippetEntry = JSON.stringify(formattedSnippet, null, 2)
            .slice(1, -1)
            .trim();

        this.elements.displayTitle.textContent = Object.keys(formattedSnippet)[0];
        this.elements.displayPrefix.textContent = currentSnip.prefix;

        // creates actual line breaks for displaying the snippet to the user
        this.elements.displayBody.textContent =
            snippetEntry.replaceAll("\\n", "\\n\n" + bodyIndent);
        //seperate object for the actual copy button without the extra \n
        this.elements.displayBody.dataset.copyText = snippetEntry;

        this.showCardState("snippet");
    };

    /**
     * displays the live form contents in the viewable snippet card area
     */
    displayLiveSnip(form = this.elements.form) {
        const bodyIndent = " ".repeat('    "body": "'.length);

        const draftSnippet = this.grabFormData(form);
        draftSnippet.body = this.snipBodyEditor.decodeText();
        const formattedSnippet = this.reformatSnippet(draftSnippet);
        const snippetEntry = JSON.stringify(formattedSnippet, null, 2)
            .slice(1, -1)
            .trim();

        if (this.elements.displayTitle) {
            this.elements.displayTitle.textContent = draftSnippet.title;
            this.elements.displayPrefix.textContent = draftSnippet.prefix;
        };
        // creates actual line breaks for displaying the snippet to the user
        this.elements.displayBody.textContent =
            snippetEntry.replaceAll("\\n", "\\n\n" + bodyIndent);

        //seperate object for the actual copy button without the extra \n
        this.elements.displayBody.dataset.copyText = snippetEntry;
        this.elements.displayCard.hidden = false;
    };

    async updatePageState(snippetId) {
        const allSnips = await this.snippetStore.refreshSnips();
        this.snippetStore.updateActiveId(snippetId);
        let currentSnip = this.snippetStore.getCurrentSnippet();

        this.elements.languageButtonList.replaceChildren()
        this.elements.snippetMenu.replaceChildren()
        this.snippetListRenderer.createLanguageList(allSnips)

        if (allSnips.length === 0) {
            this.elements.snippetMenu.hidden = true;
            this.showCardState("empty");
            return;
        };

        if (!snippetId) {
            this.elements.snippetMenu.hidden = true;
            this.showCardState("initial");
            return;
        };

        this.displayCurrentSnip(currentSnip);
    }

    handleUrlParsing() {
        const urlObject = new URLSearchParams(window.location.search);
        const snippetIdParam = urlObject.get("snippetid");
        const snippetIdFromUrl = snippetIdParam ? Number(snippetIdParam) : null;

        if (snippetIdFromUrl) {
            const idWasUpdated = this.snippetStore.updateActiveId(snippetIdFromUrl)
            //returns true so that the boolean can be evaluated if there was a URL ID
            return idWasUpdated !== false;
        };
            return false;
    };

    async updateEditForm() {
        let currentSnippet = this.snippetStore.getCurrentSnippet();
        this.loadSnippetIntoForm(currentSnippet);

        this.snipBodyEditor.renderPreview()
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
        this.elements.editForm.hidden = false;
    };

    changeCurrentSnippet (change) {
        const currentSnip = this.snippetStore.getCurrentSnippet();

        if (!currentSnip) {
            console.log("=> Invalid snippet Id provided")
            return;
        };

        const currentSnipIndex = this.snippetStore.getIndex(currentSnip.snippet_id);
        const newIndex = currentSnipIndex + change;
        const newSnip = this.snippetStore.allSnips[newIndex];

        if (!newSnip) {
            return;
        };

        this.snippetStore.updateActiveId(newSnip.snippet_id);
        return newSnip; 
    };

    /** @param {array} elements - array of elements to clear text from */
    clearText(elements) {
        elements.forEach(element => {
             element.textContent = "";
         });
        return;
    };
}


export class SnippetListRenderer {
    
    /**
     * @param {SnippetStore} snippetStore - Provides the snippet data used by the renderer.
     * @param {Object} elements - Container for all DOM elements used by this class.
     */
    constructor(snippetStore, elements) {
        this.snippetStore = snippetStore;
        this.elements = elements;
    };

    async createLanguageList() {
        const allLanguages = await this.snippetStore.presentLanguages();

        allLanguages.forEach ((lang) => {
            const languageButton = document.createElement("button");
            languageButton.textContent = lang;
            languageButton.dataset.language = lang
            this.elements.languageButtonList.appendChild(languageButton);
        });
        return this.elements.languageButtonList;
    };

    async createSnippetList(snips = null, lang = null) {
        //used to create an unorganized general snippet menu
        if (lang == null) {
            snips.forEach ((snip) => {
                const snippetOption = document.createElement("option");
                
                snippetOption.textContent = snip.title;
                snippetOption.value = snip.snippet_id;        

                this.elements.snippetMenu.appendChild(snippetOption);
            });
            return this.elements.snippetMenu;
        };

        snips.forEach ((snip) => {
            if (snip.language === lang) {
                const snippetOption = document.createElement("option");

                snippetOption.textContent = snip.title;
                snippetOption.value = snip.snippet_id

                this.elements.snippetMenu.appendChild(snippetOption);
            };
        }); 
        return this.elements.snippetMenu;
    };
};


export class HandleEvents {
    
    /**
     * @param {import("./snippet-store.js").SnippetStore} snippetStore
     * @param {ManageUi} manageUi
     * @param {SnippetListRenderer} snippetListRenderer
     * @param {Object} snipBodyEditor
     * @param {Object} elements
     */
    constructor(snippetStore, manageUi, snippetListRenderer, snipBodyEditor, elements) {
        this.elements = elements;
        this.snippetStore = snippetStore;
        this.manageUi = manageUi;
        this.snipBodyEditor = snipBodyEditor;
        this.snippetListRenderer = snippetListRenderer;
    };
    
    /** @param {string} inputValueType - value to be passed to the dispatchEvent 'inputType' property */
    sendInputEvent(inputTypeValue) {
        this.elements.textArea.dispatchEvent(
            new InputEvent("input", {
                bubbles: true,
                inputType: inputTypeValue 
            })
        );
    };

    nextButton() {
        this.elements.nextButton.addEventListener("click", () => {
            const nextSnippet = this.manageUi.changeCurrentSnippet(+1);
            if (!nextSnippet) {
                return;
            };

            this.manageUi.displayCurrentSnip(nextSnippet);
        });
    };

    prevButton() {
        this.elements.previousButton.addEventListener("click", () => {
            const previousSnippet = this.manageUi.changeCurrentSnippet(-1);
            if (!previousSnippet) {
                return;
            };

            this.manageUi.displayCurrentSnip(previousSnippet);
        });
    };

    languageButtons() {
        this.elements.languageButtonList.addEventListener("click", (langClickEvent) => {
            let clickedLangButton = langClickEvent.target.closest("button");

            let clickedLanguage = clickedLangButton.dataset.language;
            this.elements.snippetMenu.replaceChildren()
            this.snippetListRenderer.createSnippetList(this.snippetStore.allSnips, clickedLanguage);

            this.elements.languageButtonList.querySelectorAll("button").forEach(button => {
                button.setAttribute("aria-pressed", "false")
            });
            clickedLangButton.setAttribute("aria-pressed", "true")

            this.elements.snippetMenu.hidden = false; 

            this.elements.snippetMenu.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: 300, easing: "ease-in" }
            );

            return;
        });
    };
    
    snippetButtons() {
        this.elements.snippetMenu.addEventListener("change", (snipEvent) => {
            let snippetId = Number(snipEvent.target.value);
            this.snippetStore.updateActiveId(snippetId);

            const currentSnip = this.snippetStore.getCurrentSnippet();
            this.elements.editForm.hidden = true;

            this.manageUi.displayCurrentSnip(currentSnip);

            this.elements.textArea.value = currentSnip.body;
            this.snipBodyEditor.renderPreview();
        });
    };

    editButton() {
        this.elements.editButton.addEventListener("click", async() => {
            this.manageUi.updateEditForm();
        });
    };

    closeEditButton() {
        this.elements.closeEditButton.addEventListener("click", () => {
            this.elements.editForm.hidden = true;
            const savedSnippet = this.snippetStore.getCurrentSnippet();
            this.manageUi.displayCurrentSnip(savedSnippet);
            this.elements.textArea.value = savedSnippet.body;
            this.snipBodyEditor.renderPreview();

            this.manageUi.clearText([this.elements.previewArea, this.elements.displayBody]);
        });
    };
    
    deleteButton() {
        this.elements.deleteButton.addEventListener("click", async() => {
            this.snippetStore.deleteSnip();
            this.elements.editForm.hidden = true;
            this.snippetStore.refreshSnips();

            this.manageUi.updatePageState();

            this.manageUi.clearText([this.elements.previewArea, this.elements.displayBody])
        });
    };

    copyJsonButton() {
        this.elements.copyButton.addEventListener("click", async() => {
            try {
                const toCopy = this.elements.displayBody.dataset.copyText;
                await navigator.clipboard.writeText(toCopy);
                this.elements.copyButton.textContent = "Copied";
                setTimeout(() => {
                   this.elements.copyButton.textContent = "Copy"; 
                }, 2000);
            } 
            catch(error) {
                console.error("=> Error copying snippet:", error) 
            };
        });
    };
    
    submitEditButton() {
        this.elements.formSubmitButton.addEventListener("click", async(event) => {
            event.preventDefault();
            const editedSnipId = this.snippetStore.getCurrentSnippet().snippet_id;
            const formPayload = this.manageUi.grabFormData(this.elements.editForm);
            const saveSucceeded = await this.snippetStore.submitSnip(
                event,
                `${this.snippetStore.snipUrlPrefix}/edit-snippets/${editedSnipId}`,
                "PATCH",
                formPayload
            );

            if (!saveSucceeded) {
                return;
            };

            this.elements.editForm.hidden = true;
            this.elements.snippetMenu.hidden = true;
            await this.manageUi.updatePageState(editedSnipId);
        });
    };

    submitNewSnipButton() {
        this.elements.formButton.addEventListener("click", async(event) => {
            event.preventDefault();

            const formPayload = this.manageUi.grabFormData(this.elements.form)

            await this.snippetStore.submitSnip(event, 
                `${this.snippetStore.snipUrlPrefix}/snippet-creation`, 
                "POST",
                formPayload
            );

            this.manageUi.displayLiveSnip();
            this.snipBodyEditor.renderPreview();

            this.elements.form.reset()
            this.sendInputEvent("deleteContentBackwards")

            this.elements.formButton.textContent = "Saved"
            setTimeout(() => {
                this.elements.formButton.textContent = "Save"
            }, 4000);
        });
    };

    liveSnippetDisplay(form) {
        form.addEventListener("input", () => {
            this.manageUi.displayLiveSnip(form);
        });
    };

    /** @param {array} buttons - an array of button HTMLObjects */
    formListener(buttons) {
        this.elements.form.addEventListener("input", () => {
            const formPayload = this.manageUi.grabFormData(this.elements.form)

            const formValidation = Object.values(formPayload).every((formField) => {
                if (formField === null || formField.trim() === "") {
                    return false;
                };
                return true;
            });

            buttons.forEach(button => {
                if (formValidation === true) {
                    button.disabled = false;
                } else {
                    button.disabled = true
                };
            });
        });
    };

    textAreaBehavior() {
        this.elements.textArea.addEventListener("input", (inputEvent) => {
            if (inputEvent.inputType === "insertText") {
                const replacementMap = this.snipBodyEditor.findTextMap();

                if (replacementMap) {
                    this.snipBodyEditor.replaceText(replacementMap);
                };
            };

            this.snipBodyEditor.updatePlcholderCnt();
            this.snipBodyEditor.renderPreview();
        });

        this.elements.textArea.addEventListener("keydown", (keyDownEvent) => {
            const replacementMap = this.snipBodyEditor.findKeyMap(
                keyDownEvent.key
            );

            if (!replacementMap) {
                return;
            };

            keyDownEvent.preventDefault();
            this.snipBodyEditor.replaceText(replacementMap, 0);
            this.snipBodyEditor.renderPreview();

            this.sendInputEvent("insertReplacementText");

        });
    };

    hidePlaceholderButton() {
        const button = this.elements.newPlaceholder;

        if (button.hidden || button.classList.contains("snippetform__button--hiding")) {
            return;
        };

        button.classList.add("snippetform__button--hiding");
        button.addEventListener("animationend", (event) => {
            if (event.animationName !== "hide-button") {
                return;
            };

            button.hidden = true;
            button.classList.remove("snippetform__button--hiding");
        }, {once: true});
    };

    showPlaceholderButton() {
        this.elements.textArea.addEventListener("selectionchange", () => {
            const highlightCheck = this.snipBodyEditor.sliceHighlighted();
            const button = this.elements.newPlaceholder;

            if (highlightCheck === undefined) {
                this.hidePlaceholderButton();
                return;
            };

            button.hidden = false;
        });
    };

    placeholderButton() {
        this.elements.newPlaceholder.addEventListener("click", () => {
            const highlightedTextData = this.snipBodyEditor.sliceHighlighted();
            this.snipBodyEditor.createPlaceholder(highlightedTextData);

            this.sendInputEvent("insertReplacementText");

            this.hidePlaceholderButton();
        });
    };

    bindEvents(page) {
        if (page === "snips/manage-snippets") {
            this.nextButton();
            this.prevButton();
            this.languageButtons();
            this.snippetButtons();
            this.editButton();
            this.closeEditButton();
            this.deleteButton();
            this.submitEditButton();
            this.copyJsonButton();
            this.textAreaBehavior();
            this.liveSnippetDisplay(this.elements.editForm);
            this.placeholderButton();
            this.showPlaceholderButton();
            return;
        };
        if (page === "/") {
            this.formListener([this.elements.formButton, this.elements.copyButton])
            this.submitNewSnipButton();
            this.textAreaBehavior();
            this.liveSnippetDisplay(this.elements.form);
            this.copyJsonButton();
            this.placeholderButton();
            this.showPlaceholderButton();
            return;
        };
        console.log ("=> invalid endpoint")
        return;
    };
};
