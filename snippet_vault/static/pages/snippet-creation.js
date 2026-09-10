import { SnippetStore } from "/static/snippet-store.js";
import {
    ManageUi,
    SnippetListRenderer,
    HandleEvents
} from "/static/ui-management.js";
import {
    SnipBodyEditor,
    keyMaps,
    specialMaps
} from "/static/text-area.js";

const snippetCreationElements = {
    form: document.querySelector("#snip-form"),

    textArea: document.querySelector("#body"),
    previewArea: document.querySelector("#snippet-preview-area"),

    formButton: document.querySelector("#form-submit-button"),
    newPlaceholder: document.querySelector("#new-placeholder"),

    displayCard: document.querySelector("#display-card"),
    displayBody: document.querySelector("#display-body"),
    copyButton: document.querySelector("#copy-json"),
};

const snipBodyEditor = new SnipBodyEditor(
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
    snipBodyEditor, 
    snippetCreationElements 
);
const handleEvents = new HandleEvents(
    snippetStore,
    manageUi,
    snippetListRenderer,
    snipBodyEditor,
    snippetCreationElements);

//runtime
manageUi.ShowFormJson();
handleEvents.bindEvents("/snippet-creation");
