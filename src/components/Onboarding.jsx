import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useAddCourse } from '../hooks/useCourses';

const DEFAULT_COLORS = ['indigo', 'purple', 'teal', 'red', 'rose', 'amber', 'emerald', 'cyan', 'blue', 'violet'];

export function Onboarding({ onDone }) {
    const [subjects, setSubjects] = useState([{ code: '', name: '' }]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const addCourse = useAddCourse();

    const update = (idx, field, value) => {
        setSubjects(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
    };

    const addRow = () => {
        setSubjects(prev => [...prev, { code: '', name: '' }]);
    };

    const removeRow = (idx) => {
        setSubjects(prev => prev.filter((_, i) => i !== idx));
    };

    const handleDone = async () => {
        const filled = subjects.filter(s => s.code.trim() && s.name.trim());
        if (filled.length === 0) {
            setError('Add at least one subject to continue.');
            return;
        }
        setError('');
        setSaving(true);
        try {
            for (let i = 0; i < filled.length; i++) {
                await addCourse.mutateAsync({
                    code: filled[i].code.trim().toUpperCase(),
                    name: filled[i].name.trim(),
                    required_attendance: 75,
                    color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                });
            }
            onDone();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Add your subjects</h1>
                <p className="text-gray-400 text-sm mb-8">Just the code and name — that's all.</p>

                <div className="space-y-3">
                    {subjects.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                value={s.code}
                                onChange={e => update(idx, 'code', e.target.value)}
                                placeholder="Code  (e.g. CSE-101)"
                                className="w-36 shrink-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                            <input
                                value={s.name}
                                onChange={e => update(idx, 'name', e.target.value)}
                                placeholder="Subject name"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                            {subjects.length > 1 && (
                                <button
                                    onClick={() => removeRow(idx)}
                                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={addRow}
                    className="mt-3 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Plus size={16} />
                    Add another
                </button>

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                <button
                    onClick={handleDone}
                    disabled={saving}
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <>
                            Done <ArrowRight size={16} />
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                    You can always add more from Profile later.
                </p>
            </div>
        </div>
    );
}
