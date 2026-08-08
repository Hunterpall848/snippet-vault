import {SnippetStore} from "./snippet-utils.js";
import {TextBehavior, keyMaps, specialMaps} from "./text-area.js"

const textArea = document.querySelector("#body");
const snippetStore = new SnippetStore()
const textbehavior = new TextBehavior(textArea, keyMaps, specialMaps)



export class ManageUi {

    /**
     * @param {SnippetStore} snippetStore - Stores snippet data and selection state.
     * @param {SnippetListRenderer} snippetListRenderer - Renders the snippet-selection lists.
     * @param {Object} elements - Container for all DOM elements used by this class.
     */
    constructor (snippetStore, snippetListRenderer, elements) {
        this.snippetStore = snippetStore;
        this.snippetListRenderer = snippetListRenderer;
        this.elements = elements;
    };

    async initialPageState() {
        const allSnips = await this.snippetStore.refreshSnips()

        if (allSnips.length == 0) {
            this.elements.displayCard.hidden = true;
            this.elements.emptyState.hidden = false;
            return;
        };

        this.createlanguageList(allSnips)
        const validationCheck = this.handleUrlParsing()

        if (validationCheck) {
            this.showCurrentSnippet()
            return;
        };

        this.elements.initialState.hidden = false;
        this.elements.displayCard.hidden = true;
        return;
    };

    showCurrentSnippet(currentSnip) {
        let snippetTitle = currentSnip.title;
        let snippetBody = {
            prefix: currentSnip.prefix,
            body: currentSnip.body
        };
        let formatedSnip = {[snippetTitle]: snippetBody};

        this.elements.title.textContent = snippetTitle;
        this.elements.prefix.textContent = currentSnip.prefix;
        this.elements.body.textContent = JSON.stringify(formatedSnip, null, 2);

        this.elements.displayCard.hidden = false;
        this.elements.initialState.hidden = true;
    };

    async updatePageState(snippetId) {
        const allSnips = await this.snippetStore.refreshSnips();
        const matchingIndex = this.snippetStore.matchIndex(snippetId)
        this.snippetStore.updateIndexPosition(matchingIndex)
        let currentSnip = this.snippetStore.getCurrentSnippet();

        this.snippetListRenderer.elements.languageElementDiv.replaceChildren()
        this.snippetListRenderer.elements.snippetMenu.replaceChildren()
        this.languageList(allSnips)

        if (!snippetId) {
            this.elements.displayCard.hidden = true;
            this.elements.initialState.hidden = false;
            this.snippetListRenderer.elements.snippetMenu.hidden = true;
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

    selectSnippetFromUrl() {
        const urlObject = new URLSearchParams(window.location.search);
        const snippetIdParam = urlObject.get("snippetid");
        const snippetIdFromUrl = snippetIdParam ? Number(snippetIdParam) : null;

        if (snippetIdFromUrl) {
            const matchingIndex = this.snippetStore.matchIndex(snippetIdFromUrl);

            this.snippetStore.updateIndexPosition(matchingIndex)
            //returns true so that the boolean can be evaluated if there was a URL ID
            return true;
        };
            return;
    };

    async updateEditForm() {
        let currentSnippet = this.snippetStore.getCurrentSnippet();
        this.loadSnippetIntoForm(currentSnippet);

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
        this.elements.editForm.hidden = false;
    };
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

    presentLanguages() {
        const allSnips = this.snippetStore.refreshSnips()
        const languages = new Set([]); 
        allSnips.forEach ((snip) => {
            languages.add(snip.language);
        });
        return languages;
    };

    async createLanguageList() {
        const allLanguages = this.presentLanguages();

        allLanguages.forEach ((lang) => {
            const languageButton = document.createElement("button");
            languageButton.textContent = lang;
            languageButton.dataset.language = lang
            this.elements.languageElementDiv.appendChild(languageButton);
        });
        return this.elements.languageElementDiv;
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

    createLinkList(allSnips) {
        const languages = presentLanguages(allSnips);
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



const snippetListRenderer = new SnippetListRenderer(snippetStore, renderListElements);
const manageUi = new ManageUi(snippetStore, snippetListRenderer, manageUiElements);

export class HandleEvents {
    
    constructor(manageUi, snippetListRenderer, buttonElements) {
        this.buttonElements = buttonElements;
    };
    
    nextButton() {
        this.buttonElements.next.addEventListener("click", function() {
            const lastSnippetIndex = snippetStore.allSnips.length - 1
            if (snippetStore.snipIndexPosition == lastSnippetIndex) {
                return;
            }
            snippetStore.snipIndexPosition++;
            viewSnippets.buildCard();
        });
    };

    prevButton() {
        this.buttonElements.previous.addEventListener("click", function() {
            if (snippetStore.snipIndexPosition == 0) {
                return;
            }
            snippetStore.snipIndexPosition--;
            viewSnippets.buildCard();
        });
    };

    languageButtons() {
        this.buttonElements.languageButtonList.addEventListener("click", (langClickEvent) => {
            let clickedLangButton = langClickEvent.target.closest("button");

            let clickedLanguage = clickedLangButton.dataset.language;
            renderListElements.snippetMenu.replaceChildren()
            viewSnippets.snippetList(snippetStore.allSnips, clickedLanguage);
            renderListElements.snippetMenu.hidden = false; 
            return;
        });
    };
    
    snippetButtons() {
        this.buttonElements.snippetMenu.addEventListener("change", (snipEvent) => {
            let snippetId = Number(snipEvent.target.value);

            let matchingSnippet = snippetStore.matchIndex(snippetId)
            snippetStore.updateIndexPosition(matchingSnippet)

            viewSnippets.buildCard()
            manageUiElements.editForm.hidden = true;
        });
    };

    editButton() {
        this.buttonElements.editSnippet.addEventListener("click", async ()=> {
            editDatabase.updateEditForm();
        });
    };

    closeEditButton() {
        this.buttonElements.closeEditForm.addEventListener("click", () => {
            manageUiElements.editForm.hidden = true;
        });
    };
    
    deleteButton() {
        this.buttonElements.deleteSnippet.addEventListener("click", async() => {
            editDatabase.deleteSnip();
            snippetStore.refreshSnips();

            viewSnippets.updatePage();
        });
    };
    
    submitEditButton() {
        this.buttonElements.formSubmit.addEventListener("click", async(event) => {
            event.preventDefault();
            let editedSnipId = snippetStore.getCurrentSnippet().snippet_id;
            await handleFormSubmit(
                event,
                `/api/edit-snippets/${editedSnipId}`,
                "#edit-snip-form",
                "PATCH"
            );

            snippetStore.refreshSnips()

            manageUiElements.editForm.hidden = true;
            this.snippetButtons.snippetMenu.hidden = true;
            this.viewSnippets.updatePage(editedSnipId);
        });
    };

    bindEvents() {
        this.nextButton();
        this.prevButton();
        this.languageButtons();
        this.snippetButtons();
        this.editButton();
        this.closeEditButton();
        this.deleteButton();
        this.submitEditButton();
    };
};
