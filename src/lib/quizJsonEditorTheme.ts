import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const editorTheme = EditorView.theme({
    "&": {
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
    },
    ".cm-content": {
        caretColor: "var(--foreground)",
    },
    ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--foreground)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
            backgroundColor: "var(--accent)",
        },
    ".cm-activeLine": {
        backgroundColor: "var(--muted)",
    },
    ".cm-gutters": {
        backgroundColor: "var(--background)",
        color: "var(--muted-foreground)",
        border: "none",
    },
    ".cm-activeLineGutter": {
        backgroundColor: "var(--muted)",
    },
    ".cm-tooltip": {
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
    },
});

const highlightStyle = HighlightStyle.define([
    { tag: tags.propertyName, color: "var(--primary)" },
    { tag: [tags.string, tags.special(tags.string)], color: "var(--chart-2)" },
    { tag: [tags.number, tags.bool, tags.null], color: "var(--chart-1)" },
    { tag: tags.punctuation, color: "var(--muted-foreground)" },
]);

export const quizJsonEditorTheme = [
    editorTheme,
    syntaxHighlighting(highlightStyle),
];
