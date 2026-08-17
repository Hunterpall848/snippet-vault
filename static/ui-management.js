export class ManageUi {

    /**
     * @param {SnippetStore} snippetStore - Stores snippet data and selection state.
     * @param {SnippetListRenderer} snippetListRenderer - Renders the snippet-selection lists.
     * @param {Object} elements - Container for all DOM elements used by this class.
     */
    constructor (snippetStore, snippetListRenderer, textBehavior, elements) {
        this.snippetStore = snippetStore;
        this.snippetListRenderer = snippetListRenderer;
        this.textBehavior = textBehavior;
        this.elements = elements;
    };

    async initialPageState() {
        const allSnips = await this.snippetStore.refreshSnips()

        if (allSnips.length == 0) {
            this.elements.displayCard.hidden = true;
            this.elements.emptyState.hidden = false;
            return;
        };

        this.snippetListRenderer.createLanguageList(allSnips)
        const validationCheck = this.handleUrlParsing()

        if (validationCheck) {
            const currentSnip = this.snippetStore.getCurrentSnippet();
            this.showCurrentSnippet(currentSnip)
            return;
        };

        this.elements.initialState.hidden = false;
        this.elements.displayCard.hidden = true;
        return;
    };

    reformatSnippet() {

    };

    showCurrentSnippet(currentSnip) {
        let snippetTitle = currentSnip.title;
        let snippetBody = {
            prefix: currentSnip.prefix,
            body: currentSnip.body
        };
        let formatedSnip = {[snippetTitle]: snippetBody};

        this.elements.displayTitle.textContent = snippetTitle;
        this.elements.displayPrefix.textContent = currentSnip.prefix;
        this.elements.displayBody.textContent = JSON.stringify(formatedSnip, null, 2);

        this.elements.displayCard.hidden = false;
        this.elements.initialState.hidden = true;
    };

    async updatePageState(snippetId) {
        const allSnips = await this.snippetStore.refreshSnips();
        this.snippetStore.updateActiveId(snippetId);
        let currentSnip = this.snippetStore.getCurrentSnippet();

        this.elements.languageButtonList.replaceChildren()
        this.elements.snippetMenu.replaceChildren()
        this.snippetListRenderer.createLanguageList(allSnips)

        if (!snippetId) {
            this.elements.displayCard.hidden = true;
            this.elements.initialState.hidden = false;
            this.elements.snippetMenu.hidden = true;
            return;
        };

        if (allSnips.length === 0) {
            this.elements.displayCard.hidden = true;
            this.elements.emptyState.hidden = false;
            return;
        };

        this.elements.emptyState.hidden = true;
        this.showCurrentSnippet(currentSnip);
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

        this.textBehavior.renderPreview()
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

    buildNextSnippet
};



export class SnippetListRenderer {
    
    /**
     * @param {SnippetStore} snippetStore - Provides the snippet data used by the renderer.
     * @param {Object} elements - Container for all DOM elements used by this class.
     */
    constructor(snippetStore, elements) {
        this.snippetStore = snippetStore;
        this.elements = elements;
    };

    async presentLanguages() {
        const allSnips = await this.snippetStore.refreshSnips()
        const languages = new Set([]); 
        allSnips.forEach ((snip) => {
            languages.add(snip.language);
        });
        return languages;
    };

    async createLanguageList() {
        const allLanguages = await this.presentLanguages();

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

    async createLinkList(allSnips) {
        const languages = await this.presentLanguages(allSnips);
        const container = this.elements.linkList;

        container.replaceChildren()
        
        languages.forEach((lang) => {
            const languageSection = document.createElement("section");
            const languageHeading = document.createElement("h4");
            const languageList = document.createElement("ul");

            languageHeading.textContent = lang

            const matchingSnippets = allSnips.filter((snippet) => {
                  return snippet.language === lang;
            });

            matchingSnippets.forEach((snippet) => {
                const listItem = document.createElement("li");
                const link = document.createElement("a");

                link.textContent = snippet.title;
                link.href = `/?snippetid=${snippet.snippet_id}`;

                listItem.append(link);
                languageList.append(listItem);
            });
            languageSection.append(languageHeading, languageList);
            container.appendChild(languageSection);
        });
    };
};



export class HandleEvents {
    
    constructor(snippetStore, manageUi, snippetListRenderer, textBehavior, elements) {
        this.elements = elements;
        this.snippetStore = snippetStore;
        this.manageUi = manageUi;
        this.textBehavior = textBehavior;
        this.snippetListRenderer = snippetListRenderer;
    };
    
    nextButton() {
        this.elements.nextButton.addEventListener("click", () => {
            const nextSnippet = this.manageUi.changeCurrentSnippet(+1);
            if (!nextSnippet) {
                return;
            };

            this.manageUi.showCurrentSnippet(nextSnippet);
        });
    };

    prevButton() {
        this.elements.previousButton.addEventListener("click", () => {
            const previousSnippet = this.manageUi.changeCurrentSnippet(-1);
            if (!previousSnippet) {
                return;
            };

            this.manageUi.showCurrentSnippet(previousSnippet);
        });
    };

    languageButtons() {
        this.elements.languageButtonList.addEventListener("click", (langClickEvent) => {
            let clickedLangButton = langClickEvent.target.closest("button");

            let clickedLanguage = clickedLangButton.dataset.language;
            this.elements.snippetMenu.replaceChildren()
            this.snippetListRenderer.createSnippetList(this.snippetStore.allSnips, clickedLanguage);
            this.elements.snippetMenu.hidden = false; 
            return;
        });
    };
    
    snippetButtons() {
        this.elements.snippetMenu.addEventListener("change", (snipEvent) => {
            let snippetId = Number(snipEvent.target.value);
            this.snippetStore.updateActiveId(snippetId);

            const currentSnip = this.snippetStore.getCurrentSnippet()
            this.manageUi.showCurrentSnippet(currentSnip)
            this.elements.editForm.hidden = true;
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
        });
    };
    
    deleteButton() {
        this.elements.deleteButton.addEventListener("click", async() => {
            this.snippetStore.deleteSnip();
            this.elements.editForm.hidden = true;
            this.snippetStore.refreshSnips();

            this.manageUi.updatePageState();
        });
    };

    copyJsonButton() {
        this.elements.copyButton.addEventListener("click", async() => {
            try {
                const toCopy = this.elements.displayBody.textContent;
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
            let editedSnipId = this.snippetStore.getCurrentSnippet().snippet_id;
            await this.snippetStore.submitSnip(
                event,
                `/api/edit-snippets/${editedSnipId}`,
                "#snip-form",
                "PATCH"
            );

            this.snippetStore.refreshSnips()

            this.elements.editForm.hidden = true;
            this.elements.snippetMenu.hidden = true;
            this.manageUi.updatePageState(editedSnipId);
        });
    };

    submitNewSnipButton() {
        this.elements.formButton.addEventListener("click", async(event) => {
            event.preventDefault();

            await this.snippetStore.submitSnip(event, 
                "/api/snippet-creation", 
                "#snip-form", 
                "POST"
            );
            const allSnips = await this.snippetStore.refreshSnips()
            this.snippetListRenderer.createLinkList(allSnips);
        });
    };

    textAreaBehavior() {
        this.elements.textArea.addEventListener("input", (inputEvent) => {
            if (inputEvent.inputType === "insertText") {
                const replacementMap = this.textBehavior.findTextMap();

                if (replacementMap) {
                    this.textBehavior.replaceText(replacementMap);
                };
            };
            
            this.textBehavior.updatePlcholderCnt();
            this.textBehavior.renderPreview();
        });

        this.elements.textArea.addEventListener("keydown", (keyDownEvent) => {
            const replacementMap = this.textBehavior.findKeyMap(
                keyDownEvent.key
            );

            if (!replacementMap) {
                return;
            };

            keyDownEvent.preventDefault();
            this.textBehavior.replaceText(replacementMap, 0);
            this.textBehavior.renderPreview();
        });
    };

    showPlaceholderButton() {
        this.elements.textArea.addEventListener("selectionchange", () => {
            const highlightCheck = this.textBehavior.sliceHighlighted();

            if (highlightCheck === undefined) {
                //hides button if  slicehighlighted returns undefined
                this.elements.newPlaceholder.hidden = true;
                return;
            };
            this.elements.newPlaceholder.hidden = false;
        });
    };

    placeholderButton() {
        this.elements.newPlaceholder.addEventListener("click", () => {
            const highlightedTextData = this.textBehavior.sliceHighlighted();
            this.textBehavior.createPlaceholder(highlightedTextData);

            this.elements.newPlaceholder.hidden = true;
        });
    };

    bindEvents(page) {
        if (page === "/") {
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
            this.placeholderButton();
            this.showPlaceholderButton();
            return;
        };
        if (page === "/snippet-creation") {
            this.submitNewSnipButton();
            this.textAreaBehavior();
            this.placeholderButton();
            this.showPlaceholderButton();
            return;
        };
        console.log ("=> invalid endpoint")
        return;
    };
};
