import React, { useState } from 'react';
import { X, Plus, Trash2, LogOut, BookOpen, User2, Settings2, Loader2, Pencil, Check } from 'lucide-react';
import { useCourses, useAddCourse, useDeleteCourse, useUpdateCourse } from '../hooks/useCourses';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';

const COLORS = [
    { name: 'indigo', label: 'Indigo', tw: 'bg-indigo-500' },
    { name: 'purple', label: 'Purple', tw: 'bg-purple-500' },
    { name: 'blue', label: 'Blue', tw: 'bg-blue-500' },
    { name: 'teal', label: 'Teal', tw: 'bg-teal-500' },
    { name: 'emerald', label: 'Emerald', tw: 'bg-emerald-500' },
    { name: 'red', label: 'Red', tw: 'bg-red-500' },
    { name: 'rose', label: 'Rose', tw: 'bg-rose-500' },
    { name: 'amber', label: 'Amber', tw: 'bg-amber-500' },
    { name: 'cyan', label: 'Cyan', tw: 'bg-cyan-500' },
    { name: 'violet', label: 'Violet', tw: 'bg-violet-500' },
];

const COLOR_MAP = Object.fromEntries(COLORS.map(c => [c.name, c.tw]));

const EMPTY_FORM = { code: '', name: '', required_attendance: 75, color: 'indigo' };

export function Profile({ onClose, onLogout, user }) {
    const [tab, setTab] = useState('courses');
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [error, setError] = useState('');

    const { data: courses = [], isLoading } = useCourses();
    const addCourse = useAddCourse();
    const deleteCourse = useDeleteCourse();
    const updateCourse = useUpdateCourse();
    const { data: settings, isLoading: settingsLoading } = useSettings();
    const updateSettings = useUpdateSettings();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.code.trim() || !form.name.trim()) {
            setError('Subject code and name are required.');
            return;
        }
        try {
            if (editingId) {
                await updateCourse.mutateAsync({ id: editingId, ...form });
                setEditingId(null);
            } else {
                await addCourse.mutateAsync(form);
            }
            setForm(EMPTY_FORM);
            setShowAddForm(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (course) => {
        setForm({
            code: course.code,
            name: course.name,
            required_attendance: course.required_attendance,
            color: course.color,
        });
        setEditingId(course.id);
        setShowAddForm(true);
    };

    const handleCancelForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowAddForm(false);
        setError('');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-semibold text-gray-900">Profile & Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Bar */}
                <div className="flex border-b border-gray-100 bg-gray-50">
                    <button
                        onClick={() => setTab('courses')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === 'courses' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BookOpen size={16} />
                        Subjects
                    </button>
                    <button
                        onClick={() => setTab('settings')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Settings2 size={16} />
                        Settings
                    </button>
                    <button
                        onClick={() => setTab('account')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === 'account' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <User2 size={16} />
                        Account
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {tab === 'courses' && (
                        <div className="p-6 space-y-4">
                            {/* Add / Edit Form */}
                            {showAddForm ? (
                                <form onSubmit={handleFormSubmit} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-indigo-900">
                                        {editingId ? 'Edit Subject' : 'Add New Subject'}
                                    </h3>
                                    {error && (
                                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
                                            <input
                                                value={form.code}
                                                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                                placeholder="e.g. CSE-101"
                                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Min % *</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={form.required_attendance}
                                                onChange={e => setForm(f => ({ ...f, required_attendance: Number(e.target.value) }))}
                                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Subject Name *</label>
                                        <input
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="e.g. Data Structures and Algorithms"
                                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, color: c.name }))}
                                                    title={c.label}
                                                    className={`w-7 h-7 rounded-full ${c.tw} transition-transform hover:scale-110 ${form.color === c.name ? 'ring-2 ring-offset-2 ring-gray-600 scale-110' : ''
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="submit"
                                            disabled={addCourse.isPending || updateCourse.isPending}
                                            className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                                        >
                                            {(addCourse.isPending || updateCourse.isPending) ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Check size={16} />
                                            )}
                                            {editingId ? 'Save Changes' : 'Add Subject'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelForm}
                                            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="w-full border-2 border-dashed border-indigo-300 rounded-xl py-3.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add New Subject
                                </button>
                            )}

                            {/* Course List */}
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-indigo-400" />
                                </div>
                            ) : courses.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    No subjects yet. Add your first one!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {courses.map(course => (
                                        <div
                                            key={course.id}
                                            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors group"
                                        >
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${COLOR_MAP[course.color] || 'bg-indigo-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{course.name}</div>
                                                <div className="text-xs text-gray-500">{course.code} · min {course.required_attendance}%</div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                                                {confirmDeleteId === course.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => { deleteCourse.mutate(course.id); setConfirmDeleteId(null); }}
                                                            disabled={deleteCourse.isPending}
                                                            className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                                        >
                                                            {deleteCourse.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            className="px-2 py-1 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(course)}
                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDeleteId(course.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'settings' && (
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Schedule</p>

                            {/* Weekend classes toggle */}
                            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Allow weekend classes</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Show attendance grid on Saturdays &amp; Sundays</div>
                                </div>
                                {settingsLoading ? (
                                    <Loader2 size={18} className="animate-spin text-gray-300" />
                                ) : (
                                    <button
                                        onClick={() => updateSettings.mutate({ allow_weekend_classes: !settings?.allow_weekend_classes })}
                                        disabled={updateSettings.isPending}
                                        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${settings?.allow_weekend_classes ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform absolute top-1 ${settings?.allow_weekend_classes ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'account' && (
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                        {user.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{user.email}</div>
                                        <div className="text-xs text-gray-500">Signed in via Supabase Auth</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                                <div className="font-medium mb-1">Password changes</div>
                                <div className="text-xs text-amber-700">
                                    To change your password, use the "Forgot Password" flow on the sign in screen.
                                </div>
                            </div>

                            <button
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
