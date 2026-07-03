const buttonNext = document.querySelector("#next");
const buttonPrev = document.querySelector("#prev");
const buttonDel = document.querySelector("#delete");
const displayCard = document.querySelector("#display-card")
const emptyState = document.querySelector("#empty-state");

let all_snips = [];
let current_snip = {};
let indexPosition = 0;

emptyState.hidden = true;
displayCard.hidden = false;


async function getSnipJson() { 
    const response = await fetch("/api/snippets");
    all_snips = await response.json();
    return all_snips;
}


async function initPage() {
    all_snips = await getSnipJson();

    const idText = window.location.hash.slice(1).replace("snippet-", "");
    const snippetId = Number(idText);

    if (all_snips.length == 0) {
        displayCard.hidden = true;
        emptyState.hidden = false;
        return;
    } 
    if (snippetId) {
        // matches index w/ database id
        indexPosition = snippetId - 1;
        buildCard(indexPosition);
        return;
    };
    buildCard(indexPosition);
    return;
}


async function deleteSnippet() {
    let current_id = current_snip.snippet_id
    const response = await fetch (`/saved-snippets?snippet_id=${current_id}`, {
        method: "DELETE",
    })
    if (!response.ok) {
        console.log("Delete failed.");
        return;
    }
    // reloads all_snips
    await getSnipJson();

    if (indexPosition >= 0 && indexPosition < all_snips.length) {
        buildCard(indexPosition);
        return;
    }
    if (indexPosition == 0) {
        displayCard.hidden = true;
        emptyState.hidden=false;
        return;
    }
    indexPosition = indexPosition - 1;
    buildCard(indexPosition);
    return;
}


function buildCard(indexPosition) {
    current_snip = all_snips[indexPosition];
    const title = document.querySelector("#title");
    const content = document.querySelector("#content");
    title.textContent = current_snip.title;
    content.textContent = current_snip.content;

    emptyState.hidden = true;
    displayCard.hidden = false;
}


buttonNext.addEventListener("click", function() {
    if (indexPosition == all_snips.length - 1) {
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

initPage();
