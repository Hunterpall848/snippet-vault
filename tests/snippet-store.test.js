import {expect, test} from "vitest";
import {SnippetStore} from "../static/snippet-store.js"

    const mockAllSnips = [
        {
            snippet_id: 2,
            title: "Range Loop",
            language: "Python",
            prefix: "range",
            body: "for i in range(3):",
            description: "Range loop",
        },
        {
            snippet_id: 4,
            title: "For In",
            language: "JavaScript",
            prefix: "forin",
            body: "for (const x in obj) {}",
            description: "For-in loop",
        },
        {
            snippet_id: 6,
            title: "Element",
            language: "JavaScript",
            prefix: "element",
            body: 'document.createElement("div")',
            description: "Create element",
        },
    ];
    


test.for([ 
    { id: null, expected: undefined },
    { id: 2, expected: mockAllSnips[0] },
    { id: 4, expected: mockAllSnips[1] },
    { id: 6, expected: mockAllSnips[2] },
    { id: undefined, expected: undefined },
])("returns the snippet for ID $id", ({id, expected}) => {
    //this callback runs once for each test case above

    //arrange:
    const snippetStore = new SnippetStore();
    snippetStore.allSnips = mockAllSnips;
    snippetStore.currentSnipId = id;

    //act: 
    const result = snippetStore.getCurrentSnippet();
    

    //assert:
    expect(result).toEqual(expected);
    });


    
