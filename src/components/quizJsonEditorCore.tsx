import { json } from "@codemirror/lang-json";
import { quizJsonEditorTheme } from "@/lib/quizJsonEditorTheme";
import CodeMirror from "@uiw/react-codemirror";

type QuizJsonEditorCoreProps = {
    text: string;
    editable: boolean;
    onChange: (nextText: string) => void;
    onFocus: () => void;
    onBlur: () => void;
};

export default function QuizJsonEditorCore({
    text,
    editable,
    onChange,
    onFocus,
    onBlur,
}: QuizJsonEditorCoreProps) {
    return (
        <CodeMirror
            value={text}
            height="400px"
            theme="none"
            extensions={[json(), quizJsonEditorTheme]}
            editable={editable}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
}
