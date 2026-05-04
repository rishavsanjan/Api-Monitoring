import { KeywordMonitorForm } from "@/type/props";
import Editor from "@monaco-editor/react";
import { SetStateAction, useState } from "react";

interface Props {
    requestBody: string
    setForm: React.Dispatch<SetStateAction<KeywordMonitorForm>>
}

export default function JsonBodyEditor({ requestBody, setForm }: Props) {

    const [error, setError] = useState("");

    const handleChange = (value?: string) => {
        const next = value || "";
        setForm(prev => ({ ...prev, requestBody: next }))

        try {
            JSON.parse(next);
            setError("");
        } catch {
            setError("Invalid JSON requestBody");
        }
    };

    return (
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-200">Body</span>
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        raw
                    </span>
                    <span className="rounded-md bg-emerald-900/40 px-2 py-1 text-xs text-emerald-300">
                        JSON
                    </span>
                </div>
            </div>

            <Editor
                height="280px"
                defaultLanguage="json"
                value={requestBody.length === 0 ? `{
  "success": true
}` : requestBody}
                onChange={handleChange}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                }}
            />

            <div className="border-t border-slate-800 px-4 py-2">
                {error ? (
                    <p className="text-sm text-red-400">{error}</p>
                ) : (
                    <p className="text-sm text-emerald-400">Valid JSON</p>
                )}
            </div>
        </div>
    );
}