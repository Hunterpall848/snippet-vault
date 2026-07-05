const buttonDel = document.querySelector("#delete");
const snippetElementDiv = document.querySelector("#snippet-button-list");

let allSnips = [];
let currentSnip = {};

async function initEditPage () {
    allSnips = await getSnipJson();
    snippetList(allSnips, snippetElementDiv);
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
    const response = await fetch (`/view-snippets?snippet_id=${currentId}`, {
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

if (buttonDel) {
    buttonDel.addEventListener("click", function() {
        deleteSnippet()
    })
}

initEditPage();
