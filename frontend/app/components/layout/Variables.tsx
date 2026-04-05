
import React from 'react'
import { PlusIcon, TrashIcon } from 'lucide-react'
interface Extract {
    variableName: string,
    path: string
}
interface Props {
    extracts: Extract[]
    onExtractChange: (extracts: Extract[]) => void
}

const Variables: React.FC<Props> = ({ extracts, onExtractChange }) => {

    const updateExtract = (i: number, key: keyof Extract, value: string) => {
        const updated = extracts.map((e, idx) =>
            idx === i ? { ...e, [key]: value } : e
        )
        onExtractChange(updated)
    }

    const addExtract = () => onExtractChange([...extracts, { variableName: '', path: '' }])

    const removeExtract = (i: number) =>
        onExtractChange(extracts.filter((_, idx) => idx !== i))

    return (
        <div className="w-full bg-[#111827] text-white rounded-xl">
            <div className="mt-6 border-t border-slate-700 mb-4" />

            <label className="block text-sm font-semibold text-slate-200 mb-4">
                Extract variables from response
            </label>

            <div className="flex flex-col gap-3">
                {extracts.map((extract, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end"
                    >
                        {/* Variable name */}
                        <div>
                            {i === 0 && (
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Variable name
                                </label>
                            )}
                            <input
                                type="text"
                                value={extract.variableName}
                                onChange={(e) => updateExtract(i, 'variableName', e.target.value)}
                                placeholder="e.g. token"
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5
                                           text-sm text-white placeholder-slate-600 focus:outline-none
                                           focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* Variable path */}
                        <div>
                            {i === 0 && (
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    JSON path
                                </label>
                            )}
                            <input
                                type="text"
                                value={extract.path}
                                onChange={(e) => updateExtract(i, 'path', e.target.value)}
                                placeholder="e.g. data.token"
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5
                                           text-sm text-white placeholder-slate-600 focus:outline-none
                                           focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => removeExtract(i)}
                            disabled={extracts.length === 1}
                            className="p-2.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10
                                       disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Remove variable"
                        >
                            <TrashIcon size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add row */}
            <button
                type="button"
                onClick={addExtract}
                className="mt-3 flex items-center gap-1.5 text-xs text-slate-400
                           hover:text-blue-400 transition-colors"
            >
                <PlusIcon size={14} />
                Add variable
            </button>

            <div className="mt-6 border-t border-slate-700" />
        </div>
    )
}

export default Variables