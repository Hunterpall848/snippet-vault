import {describe, expect, test} from "vitest";
import {TextBehavior, keyMaps, specialMaps} from "../static/text-area.js";

function createTextBehavior(value, cursorPosition) {
    const textArea = {
        value: value,
        selectionStart: cursorPosition,
        selectionEnd: cursorPosition,
    };
    const previewArea = {textContent: ""};
    const textBehavior = new TextBehavior(
        textArea,
        previewArea,
        keyMaps,
        specialMaps
    );

    return {textArea, previewArea, textBehavior};
};

describe("TextBehavior", () => {
    test("replaces a typed trigger and moves the cursor", () => {
        const {textArea, textBehavior} = createTextBehavior('"', 1);
        const replacementMap = textBehavior.findTextMap();

        textBehavior.replaceText(replacementMap);

        expect(textArea.value).toBe('"\\');
        expect(textArea.selectionStart).toBe(2);
        expect(textArea.selectionEnd).toBe(2);
    });

    test("inserts a special-key replacement without deleting existing text", () => {
        const {textArea, textBehavior} = createTextBehavior("abcd", 2);
        const replacementMap = textBehavior.findKeyMap("Enter");

        textBehavior.replaceText(replacementMap, 0);

        expect(textArea.value).toBe("ab\\ncd");
        expect(textArea.selectionStart).toBe(4);
    });

    test("builds and renders readable preview text", () => {
        const {previewArea, textBehavior} = createTextBehavior(
            'console.log("hello")\\n',
            22
        );

        const previewText = textBehavior.formatPreview();
        textBehavior.renderPreview();

        expect(previewText).toBe('console.log("hello")\n');
        expect(previewArea.textContent).toBe(previewText);
    });
});
