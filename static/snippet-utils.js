
export async function getSnipJson() { 
    const response = await fetch("/api/snippets");
    return await response.json();
    
}

export async function snippetList() {
    const snippetElementDiv = document.querySelector("#snippet-button-list");
    const allSnips = await getSnipJson()
    allSnips.forEach((snippet) => {
        const buttonElement = document.createElement("button");
        
        buttonElement.type = "button";
        buttonElement.textContent = snippet.title;
        //need custom data on the button to locate correct snippet on click
        buttonElement.dataset.snippetId = snippet.snippet_id;        
        snippetElementDiv.appendChild(buttonElement);
        return snippetElementDiv;
    });
};
