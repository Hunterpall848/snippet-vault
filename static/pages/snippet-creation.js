import {SnippetStore} from "./snippet-store.js"
import {TextBehavior, keyMaps, specialMaps} from "./text-area.js"
import {SnippetListRenderer} from "./ui-management.js"

const snippetCreationElements = {
    textArea: document.querySelector("#body"),
    formButton: document.querySelector("#form-submit-button"),
    linkList: document.querySelector("#link-list"),
};

const snippetStore = new SnippetStore();
const snippetListRenderer = new SnippetListRenderer(snippetStore, snippetCreationElements);
const textBehavior = new TextBehavior(
    snippetCreationElements.textArea,
    keyMaps,
    specialMaps
);



async function initSnipCreationPage() {
    const allSnips = await snippetStore.refreshSnips() 
    snippetListRenderer.createLinkList(allSnips);
    textBehavior.createEventListeners();
};

snippetCreationElements.formButton.addEventListener("click", async function(event) {
    await snippetStore.submitSnip(event, 
        `/api/snippet-creation`, 
        "#new-snip-form", 
        "POST"
    );
    const allSnips = await snippetStore.refreshSnips()
    createLinkList(allSnips);
});

initSnipCreationPage();

