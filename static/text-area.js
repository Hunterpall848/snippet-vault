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
//controls the behavior of the textarea within the "body" form section

    constructor(textArea, keyMaps, specialMaps) {
        this.textArea = textArea;
        this.keyMaps = keyMaps;
        this.specialMaps = specialMaps;
    };

    init() {
        this.textArea.addEventListener("input", (inputEvent) => {
            //need to ensure that special keys are denied access
            if (inputEvent.inputType === "insertText") {
                let validKeyMap = this.handleKeypress()
                if (!validKeyMap) {
                    return;
                };
                this.insertText(validKeyMap)
                return;
            }
            return;
        })

        this.textArea.addEventListener("keydown", (keyDownEvent) => {
            const isSingleTypedCharacter = keyDownEvent.key.length === 1;
            //need to ensure that character keys are denied access
            if (isSingleTypedCharacter) {
                return;
            };

            let validSpecialMap = this.handleSpecialpress(keyDownEvent) 
            if (!validSpecialMap) {
                return;
            };
            //must pass null here to force argument into position
            this.insertText(null, validSpecialMap);
            return;
        });

        this.textArea.addEventListener("input", () => {
            this.generatePreviewText();
        });
    };
    
    handleSpecialpress(keyDownEvent) {
       let validSpecialMap = specialMaps.find((specialMap) => 
           keyDownEvent.key === specialMap.trigger 
        );
        if (!validSpecialMap) {
            return;
        };
        keyDownEvent.preventDefault();
        return validSpecialMap;
    };

    handleKeypress() {
        let allText = this.textArea.value;
        let textCursorPosition = this.textArea.selectionStart;
        let textBeforeCursor = allText.slice(0,textCursorPosition)
        let matchingKeymap;

        //endswith can match strings of inifinite length as lomg as input is correct
        matchingKeymap = this.keyMaps.find(
            (currentKeymap) =>
                textBeforeCursor.endsWith(currentKeymap.trigger)
        );

        if (!matchingKeymap) {
            return;
        }
        else {
            return matchingKeymap
        }
    };

    //issue: keypresses that  dont produce text will break this (tab)
    insertText(validKeyMap=null, validSpecialMap=null) {
        const allText = this.textArea.value;
        const cursorPosition = this.textArea.selectionStart;
        const textAfterCursor = allText.slice(cursorPosition);
        let triggerLength;
        let replacementText;
        let textBeforeTrigger;

        if (validKeyMap) {
            triggerLength = validKeyMap.trigger.length;
            replacementText = validKeyMap.replacement;
            textBeforeTrigger = allText.slice(0,cursorPosition - triggerLength);
        };

        if (validSpecialMap) {
            //special keymaps have no textarea length
            triggerLength = 0;
            replacementText = validSpecialMap.replacement;
            textBeforeTrigger = allText.slice(0,cursorPosition - triggerLength);
        };

        this.textArea.value =
            textBeforeTrigger +
            replacementText +
            textAfterCursor;

        const newCursorPosition =
            textBeforeTrigger.length + replacementText.length;

        this.textArea.selectionStart = newCursorPosition;
        this.textArea.selectionEnd = newCursorPosition;
    }

    generatePreviewText () {
        const previewText = document.querySelector("#snippet-preview-area") 
        let defaultFormatText = this.textArea.value;

        keyMaps.forEach(map => {
            defaultFormatText = 
                defaultFormatText.replaceAll(map.replacement,map.default);
        });

        specialMaps.forEach(map => {
            defaultFormatText = 
                defaultFormatText.replaceAll(map.replacement,map.default);
        });
        previewText.textContent = defaultFormatText
    }
};

