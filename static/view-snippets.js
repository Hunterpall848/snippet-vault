import {getSnipJson, snippetList} from "./snippet-utils.js";

const buttonNext = document.querySelector("#next");
const buttonPrev = document.querySelector("#prev");
const displayCard = document.querySelector("#display-card")
const emptyState = document.querySelector("#empty-state");
const snippetElementDiv = document.querySelector("#snippet-button-list");

let allSnips = [];
let indexPosition = 0;

function getCurrentSnippet() {
    return allSnips[indexPosition]
}

async function initViewPage() {
    allSnips = await getSnipJson();

    const urlQueryValues = new URLSearchParams(window.location.search);
    const snippetIdParam = urlQueryValues.get("snippetid");
    const snippetIdFromUrl = snippetIdParam ? Number(snippetIdParam) : null;

    if (allSnips.length == 0) {
        displayCard.hidden = true;
        emptyState.hidden = false;
        return;
    } 

    if (snippetIdFromUrl) {
        const matchingIndex = allSnips.findIndex((snip) => snip.snippet_id === snippetIdFromUrl);
        // this checks to make sure the indexposition points to an actual value in the db
        if (matchingIndex !== -1) {
            indexPosition = matchingIndex;
        }
        buildCard();
        snippetList();
        return;
    };

    buildCard();
    snippetList();
 }

function buildCard() {
    let currentSnip = getCurrentSnippet();

    const title = document.querySelector("#title");
    const prefix = document.querySelector("#prefix")
    const body = document.querySelector("#body");

    title.textContent = currentSnip.title;
    prefix.textContent = currentSnip.prefix;
    body.textContent = currentSnip.body;

    displayCard.hidden = false;
}

if (buttonNext) {
    buttonNext.addEventListener("click", function() {
        const lastSnippetIndex = allSnips.length-1
        if (indexPosition == lastSnippetIndex) {
            return;
        } 
        indexPosition++;
        buildCard();
    })
}

if (buttonPrev) {
    buttonPrev.addEventListener("click", function() {
        if (indexPosition == 0) {
            return;
        }
        indexPosition--;
        buildCard();
    }) 
}

if (snippetElementDiv) {
    snippetElementDiv.addEventListener("click", (clickEvent) => {
            const clickedButton = clickEvent.target.closest("button");
            const snippetIdFromButton = Number(clickedButton.dataset.snippetId);

            indexPosition = allSnips.findIndex((snip) => snip.snippet_id === snippetIdFromButton);
            buildCard();
    });
}

initViewPage();
