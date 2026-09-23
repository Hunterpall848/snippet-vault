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

const manageSnipsElements = {
    displayCard: document.querySelector("#display-card"),
    initialState: document.querySelector("#initial-state"),
    emptyState: document.querySelector("#empty-state"),
    snippetView: document.querySelector("#snippet-view"),
    displayTitle: document.querySelector("#display-title"),
    displayPrefix: document.querySelector("#display-prefix"),
    displayBody: document.querySelector("#display-body"),
    editFormContainer: document.querySelector(".snippetform--compact"),
    editForm: document.querySelector("#snip-form"),

    languageButtonList: document.querySelector("#language-button-list"),
    snippetMenu: document.querySelector("#snippet-menu"),

    copyButton: document.querySelector("#copy-json"),
    nextButton: document.querySelector("#next"),
    previousButton: document.querySelector("#prev"),
    editButton: document.querySelector("#edit-snippet"),
    deleteButton: document.querySelector("#delete-button"),
    closeEditButton: document.querySelector("#close-edit"),
    formSubmitButton: document.querySelector("#form-submit-button"),
    newPlaceholder: document.querySelector("#new-placeholder"),

    textArea: document.querySelector("#body"),
    previewArea: document.querySelector("#snippet-preview-area"),
};

const snipBodyEditor = new SnipBodyEditor(
    manageSnipsElements.textArea,
    manageSnipsElements.previewArea,
    keyMaps, 
    specialMaps
);
const snippetStore = new SnippetStore()
const snippetListRenderer = new SnippetListRenderer(
    snippetStore, 
    {
        languageButtonList: manageSnipsElements.languageButtonList,
        snippetMenu: manageSnipsElements.snippetMenu,
    },
);
const manageUi = new ManageUi(
    snippetStore, 
    snippetListRenderer, 
    snipBodyEditor, 
    manageSnipsElements
);
const handleEvents = new HandleEvents(
    snippetStore,
    manageUi,
    snippetListRenderer,
    snipBodyEditor,
    manageSnipsElements);

//runtime
manageUi.initialPageState()
handleEvents.bindEvents("snips/manage-snippets")
