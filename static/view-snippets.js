const buttonNext = document.querySelector("#next");
const buttonPrev = document.querySelector("#prev");
const buttonDel = document.querySelector("#delete");
const displayCard = document.querySelector("#display-card")
const emptyState = document.querySelector("#empty-state");


let allSnips = [];
let currentSnip = {};
let indexPosition = 0;


async function getSnipJson() { 
    const response = await fetch("/api/snippets");
    allSnips = await response.json();
    return allSnips;
}

async function initPage() {
    allSnips = await getSnipJson();

    const urlQueryValues = new URLSearchParams(window.location.search);
    const snippetIdFromUrl = Number(urlQueryValues.get("snippetid"))

    if (allSnips.length == 0) {
        displayCard.hidden = true;
        emptyState.hidden = false;
        return;
    } 
    if (snippetIdFromUrl) {
        indexPosition = allSnips.findIndex((snip) => snip.snippet_id === snippetIdFromUrl);
        buildCard(indexPosition);
        snippetList();
        return;
    };
    buildCard(indexPosition);
    snippetList();
    return;
}

async function deleteSnippet() {
    let currentId = currentSnip.snippet_id;
    let currentTitle = currentSnip.title;
    let currentButtonElemnt = document.querySelector(`[data-snippet-id="${currentId}"]`);
    const deleteWindowMessage = `
    Delete snippet: ${currentTitle}?

    This action cannot be undone.`;

    const userDeleteConfirmation = confirm(deleteWindowMessage);
    if (!userDeleteConfirmation) {
        return;
    };
    const response = await fetch (`/saved-snippets?snippet_id=${currentId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        console.log("Delete failed.");
        return;
    };
    if (currentButtonElemnt) {
        currentButtonElemnt.remove();
    };
    // reloads allSnips to update list
    await getSnipJson();

    if (indexPosition >= 0 && indexPosition < allSnips.length) {
        buildCard(indexPosition);
        return;
    };
    if (indexPosition == 0) {
        displayCard.hidden = true;
        emptyState.hidden=false;
        return;
    };
    //ensures invalid index positions are handled
    indexPosition = indexPosition - 1;
    buildCard(indexPosition);
    return;
};

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

function snippetList() {
    const snippetElementDiv = document.querySelector("#snippet-button-list");

    allSnips.forEach((snippet) => {
        const buttonElement = document.createElement("button");
        
        buttonElement.type = "button";
        buttonElement.textContent = snippet.title;
        //need custom data on the button to locate correct snippet on click
        buttonElement.dataset.snippetId = snippet.snippet_id;        
        snippetElementDiv.appendChild(buttonElement);
    });
    snippetElementDiv.addEventListener("click", (clickEvent) => {
        const clickedButton = clickEvent.target.closest("button");
        const snippetIdFromButton = Number(clickedButton.dataset.snippetId);

        indexPosition = allSnips.findIndex((snip) => snip.snippet_id === snippetIdFromButton);
        buildCard(indexPosition);
    });
};

buttonNext.addEventListener("click", function() {
    if (indexPosition == allSnips.length - 1) {
        return;
    } 
    indexPosition++;
    buildCard(indexPosition);
})

buttonPrev.addEventListener("click", function() {
    if (indexPosition == 0) {
        return;
    }
    indexPosition--;
    buildCard(indexPosition);
}) 

buttonDel.addEventListener("click", function() {
    deleteSnippet()
})

//this needs to run first
initPage();
