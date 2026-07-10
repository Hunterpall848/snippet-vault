import {getSnipJson, handleFormSubmit} from "./snippet-utils.js"
import {TextBehavior, keyMaps, specialMaps} from "./text-area.js"


const textArea = document.querySelector("#body");
let formButton = document.querySelector("#form-submit-button")
let allSnips = []

const textbehavior = new TextBehavior(textArea, keyMaps, specialMaps)

async function initSnipCreationPage() {
    allSnips = await getSnipJson()
}

async function addNewTitleLink () {
    let newSnipEntry = document.querySelector("#snippet-titles")

    const listItem = document.createElement("li");
    const link = document.createElement("a");
    const lastSnip = allSnips[allSnips.length - 1]

    link.textContent = lastSnip.title;
    link.href =`/view-snippets?snippetid=${lastSnip.snippet_id}`;

    listItem.append(link);
    newSnipEntry.append(listItem);
}

//must initialize eventlistener on textarea form section
textbehavior.init()

formButton.addEventListener("click", async function(event) {
    allSnips = await handleFormSubmit(event, `/api/snippet-creation`, "#new-snip-form", "POST");
    addNewTitleLink()
})

initSnipCreationPage()
