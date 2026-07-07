import {getSnipJson, handleFormSubmit} from "./snippet-utils.js"

let formButton = document.querySelector("#form-submit-button")
let allSnips = []

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

formButton.addEventListener("click", async function(event) {
    allSnips = await handleFormSubmit(event, "/snippet-creation");
    addNewTitleLink()
})

initSnipCreationPage()
