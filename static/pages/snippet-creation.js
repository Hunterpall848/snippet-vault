import { SnippetStore } from "/static/snippet-store.js";
import {
    ManageUi,
    SnippetListRenderer,
    HandleEvents
} from "/static/ui-management.js";
import {
    TextBehavior,
    keyMaps,
    specialMaps
} from "/static/text-area.js";

const snippetCreationElements = {
    textArea: document.querySelector("#body"),
    previewArea: document.querySelector("#snippet-preview-area"),
    formButton: document.querySelector("#form-submit-button"),
    linkList: document.querySelector("#link-list"),
    newPlaceholder: document.querySelector("#new-placeholder"),
};

const textBehavior = new TextBehavior(
    snippetCreationElements.textArea,
    snippetCreationElements.previewArea,
    keyMaps, 
    specialMaps
);
const snippetStore = new SnippetStore()
const snippetListRenderer = new SnippetListRenderer(snippetStore, snippetCreationElements);
const manageUi = new ManageUi(
    snippetStore, 
    snippetListRenderer, 
    textBehavior, 
    snippetCreationElements 
);
const handleEvents = new HandleEvents(
    snippetStore,
    manageUi,
    snippetListRenderer,
    textBehavior,
    snippetCreationElements);

async function initSnipCreationPage() {
    const allSnips = await snippetStore.refreshSnips() 
    snippetListRenderer.createLinkList(allSnips);
};

//runtime
initSnipCreationPage();
handleEvents.bindEvents("/snippet-creation");
