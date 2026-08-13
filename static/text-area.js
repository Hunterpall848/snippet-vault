export const keyMaps = [
    {
        trigger: '"', 
        replacement: '"\\',
        default: '"', 
    },
    {
        //js reads this as trigger = \ and replacement = \\
        trigger: "\\",
        replacement: "\\\\",
        default: "\\",
    },
    {
        trigger: "$i", //where i is an int
        replacement: "${i:value}",
        default: "<placeholder>",
    },
];

export const specialMaps = [
    {
        trigger: "Tab",
        replacement: "\\t",
        default: "\t",
    },
    {
        trigger: "Enter",
        replacement: "\\n",
        default: "\n",
    },
]


export class TextBehavior {

    /**
     * @param {HTMLTextAreaElement} textArea - Textarea controlled by this class.
     * @param {HTMLElement} previewArea - Element that displays the readable preview.
     * @param {Array<Object>} keyMaps - Mappings for regular character triggers.
     * @param {Array<Object>} specialMaps - Mappings for special keyboard keys.
     */
    constructor(textArea, previewArea, keyMaps, specialMaps) {
        this.textArea = textArea;
        this.previewArea = previewArea;
        this.keyMaps = keyMaps;
        this.specialMaps = specialMaps;
    };

    findTextMap() {
        const textBeforeCursor = this.textArea.value.slice(
            0,
            this.textArea.selectionStart
        );

        return this.keyMaps.find(
            (keyMap) => textBeforeCursor.endsWith(keyMap.trigger)
        );
    };

    findKeyMap(key) {
        return this.specialMaps.find(
            (specialMap) => key === specialMap.trigger
        );
    };

    replaceText(replacementMap, triggerLength = replacementMap.trigger.length) {
        const allText = this.textArea.value;
        const cursorPosition = this.textArea.selectionStart;
        const textBeforeTrigger = allText.slice(
            0,
            cursorPosition - triggerLength
        );
        const textAfterCursor = allText.slice(cursorPosition);
        const newCursorPosition = textBeforeTrigger.length + replacementMap.replacement.length;

        this.textArea.value =
            textBeforeTrigger +
            replacementMap.replacement +
            textAfterCursor;
        this.textArea.selectionStart = newCursorPosition;
        this.textArea.selectionEnd = newCursorPosition;
    };

    formatPreview() {
        let previewText = this.textArea.value;
        const allMaps = [...this.keyMaps, ...this.specialMaps];

        allMaps.forEach((map) => {
            if (map.default === "<placeholder>") {
                return;
            };

            previewText = previewText.replaceAll(
                map.replacement,
                map.default
            );
        });

        return previewText;
    };

    renderPreview() {
        this.previewArea.textContent = this.formatPreview();
    };
};
