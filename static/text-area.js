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
        trigger: "$0", //where i is an int
        replacement: "${0}",
        default: "ignore",
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
        this.placeholderCount = null;
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
            if (map.default === "ignore") {
                return;
            };

        previewText = previewText.replaceAll(map.replacement,map.default);
        });
        return previewText;
    };

    renderPreview() {
        this.previewArea.textContent = this.formatPreview();
    };

    updatePlcholderCnt() {
        const target = /\$\{\d+:[^}]*\}/g;
        const textArea = this.textArea.value;

        const targetMatches = textArea.match(target) || [];
        this.placeholderCount = targetMatches.length + 1;
        return this.placeholderCount;
    };

    sliceHighlighted() {
        let highlightedTextData = {};
        const selectionStart = this.textArea.selectionStart;
        const selectionEnd = this.textArea.selectionEnd;

        //used to deny access to non highlights
        if (selectionStart === selectionEnd) {
            return;
        };
        
        highlightedTextData = {
            highlightedText: this.textArea.value.slice(selectionStart, selectionEnd),
            selectionStart,
            selectionEnd,
        };
        return highlightedTextData;
    }; 

    createPlaceholder(highlightedTextData) {
         if (highlightedTextData === undefined) {
            return;
         };
        
        const placeholder = "${" 
        + this.placeholderCount 
        + ":" 
        + highlightedTextData.highlightedText 
        + "}";

        this.textArea.setRangeText(
            placeholder,
            highlightedTextData.selectionStart,
            highlightedTextData.selectionEnd,
            "end"
        );
    };
};
