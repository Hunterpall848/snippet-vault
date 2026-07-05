const buttonNext = document.querySelector("#next");
const buttonPrev = document.querySelector("#prev");
const displayCard = document.querySelector("#display-card")
const emptyState = document.querySelector("#empty-state");
const snippetElementDiv = document.querySelector("#snippet-button-list");

let allSnips = [];
let currentSnip = {};
let indexPosition = 0;

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
        if (matchingIndex !== -1) {
            indexPosition = matchingIndex;
        }
        buildCard(indexPosition);
        snippetList(allSnips, snippetElementDiv);
        return;
    };

    buildCard(indexPosition);
    snippetList(allSnips, snippetElementDiv);
 }

function buildCard(indexPosition) {
    currentSnip = allSnips[indexPosition];

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
        if (indexPosition == allSnips.length - 1) {
            return;
        } 
        indexPosition++;
        buildCard(indexPosition);
    })
}

if (buttonPrev) {
    buttonPrev.addEventListener("click", function() {
        if (indexPosition == 0) {
            return;
        }
        indexPosition--;
        buildCard(indexPosition);
    }) 
}

if (snippetElementDiv) {
    snippetElementDiv.addEventListener("click", (clickEvent) => {
            const clickedButton = clickEvent.target.closest("button");
            const snippetIdFromButton = Number(clickedButton.dataset.snippetId);

            indexPosition = allSnips.findIndex((snip) => snip.snippet_id === snippetIdFromButton);
            buildCard(indexPosition);
    });
}

initViewPage();
