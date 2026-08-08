import { SnippetStore } from "./snippet-store.js";
import {
    ManageUi,
    SnippetListRenderer,
    HandleEvents
} from "./ui-management.js";
import {
    TextBehavior,
    keyMaps,
    specialMaps
} from "./text-area.js";

const manageSnipsElements = {
    displayCard: document.querySelector("#display-card"),
    initialState: document.querySelector("#initial-state"),
    emptyState: document.querySelector("#empty-state"),
    displayTitle: document.querySelector("#display-title"),
    displayPrefix: document.querySelector("#display-prefix"),
    displayBody: document.querySelector("#display-body"),
    editForm: document.querySelector("#edit-snip-form"),

    languageButtonList: document.querySelector("#language-button-list"),
    snippetMenu: document.querySelector("#snippet-menu"),

    nextButton: document.querySelector("#next"),
    previousButton: document.querySelector("#prev"),
    editButton: document.querySelector("#edit-snippet"),
    deleteButton: document.querySelector("#delete-button"),
    closeEditButton: document.querySelector("#close-edit"),

    textArea: document.querySelector("#body"),
};

const snippetListRenderer = new SnippetListRenderer(snippetStore, manageSnipElements);
const manageUi = new ManageUi(snippetStore, snippetListRenderer, manageSnipElements);
const handleEvents = new HandleEvents(manageUi, snippetListRenderer, manageSnipsElements);



