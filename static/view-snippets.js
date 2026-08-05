import {getSnipJson, snippetList, languageList} from "./snippet-utils.js";

const buttonNext = document.querySelector("#next");
const buttonPrev = document.querySelector("#prev");
const displayCard = document.querySelector("#display-card")
const emptyState = document.querySelector("#empty-state");
const languageElementDiv = document.querySelector("#language-button-list");
const snippetElementDiv = document.querySelector("#snippet-button-list")

let allSnips = [];
let indexPosition = 0;

function getCurrentSnippet() {
    return allSnips[indexPosition]
}

function handleUrlParsing (allSnips) {
    const urlQueryValues = new URLSearchParams(window.location.search);
    const snippetIdParam = urlQueryValues.get("snippetid");
    const snippetIdFromUrl = snippetIdParam ? Number(snippetIdParam) : null;

    if (snippetIdFromUrl) {
        const matchingIndex = allSnips.findIndex((snip) => snip.snippet_id === snippetIdFromUrl);
        // this checks to make sure the indexposition points to an actual value in the db
        if (matchingIndex !== -1) {
            indexPosition = matchingIndex;
            return;
        };
        return;
    };
};

async function initViewPage() {
    allSnips = await getSnipJson();

    if (allSnips.length == 0) {
        displayCard.hidden = true;
        emptyState.hidden = false;
        return;
    }; 

    handleUrlParsing(allSnips);
    languageList(allSnips)
    buildCard();
    return;
};

function refactorSnippetJson () {
    let defaultSnippet = getCurrentSnippet();
    let snippetTitle = defaultSnippet.title;
    let snippetBody = {
        prefix : defaultSnippet.prefix,
        body : defaultSnippet.body
    };
    let formatedSnippet = {[snippetTitle] : snippetBody};
    return formatedSnippet;
};

function buildCard() {
    let currentSnip = getCurrentSnippet();
    let currentSnipJson = refactorSnippetJson();

    const title = document.querySelector("#title");
    const prefix = document.querySelector("#prefix")
    const body = document.querySelector("#body");

    title.textContent = currentSnip.title;
    prefix.textContent = currentSnip.prefix;
    body.textContent = JSON.stringify(currentSnipJson, null, 2);

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

//TODO: snippet buttons display need to be reset each lang button click they stack forever
if (languageElementDiv) {
    languageElementDiv.addEventListener("click", (langClickEvent) => {
        let clickedLangButton = langClickEvent.target.closest("button");

        if (clickedLangButton) {
            let clickedLanguage = clickedLangButton.dataset.language;
            snippetElementDiv.replaceChildren()
            snippetList(allSnips, clickedLanguage);
            return;
        };
        return;
    });

    snippetElementDiv.addEventListener("click", (snipClickEvent) => {
        let clickedSnipButton = snipClickEvent.target.closest("button");
        let snippetId = Number(clickedSnipButton.dataset.snippetId);

        //returns the index of the index where snip.snippet_id and snippetId are a match
        let matchingSnippet = allSnips.findIndex((snip) => {
            return snip.snippet_id === snippetId;
        });

        indexPosition = matchingSnippet
        buildCard()
    });
};

initViewPage();
