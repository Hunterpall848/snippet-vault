// source script for the snippet-creation template
// js overrides and handles form POST
let formButton = document.querySelector("#form-submit-button")
all_snips = []


async function getJsonData () {
   const response = await fetch("/api/snippets");
    all_snips = await response.json();
}


async function addNewTitleLink () {
    let newSnipEntry = document.querySelector("#snippet-titles")

    const listItem = document.createElement("li");
    const link = document.createElement("a");
    const lastSnip = all_snips[all_snips.length - 1]

    link.textContent = lastSnip.title;
    link.href =`/saved-snippets#snippet-${lastSnip.snippet_id}`;

    listItem.append(link);
    newSnipEntry.append(listItem);
}


async function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.querySelector("#new-snip-form")
    //create new form object class using current form
    const formData = new FormData(form)

    const grabSnippetForm = {
        snippet_id: formData.get("snippet_id"),
        title: formData.get("title"),
        language: formData.get("language"),
        tags: formData.get("tags"),
        content: formData.get("content"),
        notes: formData.get("notes"),
    };
    const response = await fetch("/snippet-creation", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(grabSnippetForm),
    })
    if (!response.ok) {
        console.log("Save failed.");
        return;
    }

    await getJsonData()
    addNewTitleLink();
    form.reset();
    return;
}
formButton.addEventListener("click", handleFormSubmit)


