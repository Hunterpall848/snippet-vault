import {describe, expect, test} from "vitest";
import {SnipBodyEditor, keyMaps, specialMaps} from "../snippet_vault/static/text-area.js";

function createSnipBodyEditor(value, cursorPosition) {
    const textArea = {
        value: value,
        selectionStart: cursorPosition,
        selectionEnd: cursorPosition,
    };
    const previewArea = {textContent: ""};
    const snipBodyEditor = new SnipBodyEditor(
        textArea,
        previewArea,
        keyMaps,
        specialMaps
    );

    return {textArea, previewArea, snipBodyEditor};
};

describe("SnipBodyEditor test", () => {
    test("replaces a typed trigger and moves the cursor", () => {
        const {textArea, snipBodyEditor} = createSnipBodyEditor('"', 1);
        const replacementMap = snipBodyEditor.findTextMap();

        snipBodyEditor.replaceText(replacementMap);

        expect(textArea.value).toBe('"\\');
        expect(textArea.selectionStart).toBe(2);
        expect(textArea.selectionEnd).toBe(2);
    });

    test("inserts a special-key replacement without deleting existing text", () => {
        const {textArea, snipBodyEditor} = createSnipBodyEditor("abcd", 2);
        const replacementMap = snipBodyEditor.findKeyMap("Enter");

        snipBodyEditor.replaceText(replacementMap, 0);

        expect(textArea.value).toBe("ab\\ncd");
        expect(textArea.selectionStart).toBe(4);
    });

    test("builds and renders readable preview text", () => {
        const {previewArea, snipBodyEditor} = createSnipBodyEditor(
            'console.log("hello")\\n',
            22
        );

        const previewText = snipBodyEditor.decodeText();
        snipBodyEditor.renderPreview();

        expect(previewText).toBe('console.log("hello")\n');
        expect(previewArea.textContent).toBe(previewText);
    });

    test("counts placeholders in a mock textarea", () => {
        const mockText = [
            "This is ordinary textarea text.",
            "Replace ${1:this value} and ${2:this other value}.",
            "A normal JavaScript expression like ${username} is ignored.",
            "The last placeholder is ${3:final value}.",
        ].join("\n");

        const {textArea, snipBodyEditor} = createSnipBodyEditor(
            mockText,
            mockText.length
        );

        expect(textArea.value).toBe(mockText);
        expect(snipBodyEditor.scanTextArea()).toBe(3);
        expect(snipBodyEditor.placeholderCount).toBe(3);
    });

    test("returns zero when a mock textarea has no placeholders", () => {
        const mockText = "There are no numbered placeholders here.";
        const {snipBodyEditor} = createSnipBodyEditor(mockText, mockText.length);

        expect(snipBodyEditor.scanTextArea()).toBe(0);
    });
});
