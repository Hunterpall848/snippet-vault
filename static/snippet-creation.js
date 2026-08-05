import {getSnipJson, handleFormSubmit, presentLanguages} from "./snippet-utils.js"
import {TextBehavior, keyMaps, specialMaps} from "./text-area.js"


const textArea = document.querySelector("#body");
let formButton = document.querySelector("#form-submit-button");
let allSnips = [];

const textbehavior = new TextBehavior(textArea, keyMaps, specialMaps);

async function initSnipCreationPage() {
    allSnips = await getSnipJson();
    createLinkList(allSnips);
};

function createLinkList(allSnips) {
    const languages = presentLanguages(allSnips);
    const container = document.querySelector("#link-list");

    container.replaceChildren()
    
    languages.forEach((lang) => {
        const languageSection = document.createElement("section");
        const languageHeading = document.createElement("h4");
        const languageList = document.createElement("ul");

        languageHeading.textContent = lang

        const matchingSnippets = allSnips.filter((snippet) => {
              return snippet.language === lang;
        });

        matchingSnippets.forEach((snippet) => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");

            link.textContent = snippet.title;
            link.href = `/?snippetid=${snippet.snippet_id}`;

            listItem.append(link);
            languageList.append(listItem);
        });
        languageSection.append(languageHeading, languageList);
        container.appendChild(languageSection);
    }); 
};

//must initialize eventlistener on textarea form section
textbehavior.init()

formButton.addEventListener("click", async function(event) {
    allSnips = await handleFormSubmit(event, 
        `/api/snippet-creation`, 
        "#new-snip-form", 
        "POST"
    );
    createLinkList(allSnips);
});

initSnipCreationPage();
