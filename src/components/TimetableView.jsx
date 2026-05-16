import React, { useState, useMemo } from 'react';
import { X, Pencil, CheckSquare, Trash2, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTimetable, useUpsertTimetableSlot, useDeleteTimetableSlot } from '../hooks/useTimetable';
import { useSettings } from '../hooks/useSettings';

const ALL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const WEEKDAYS = ALL_DAYS.slice(0, 5);
const TIMES = [
  '8:00-8:55', '9:00-9:55', '10:00-10:55', '11:00-11:55', '12:00-12:55',
  '13:30-14:25', '14:30-15:25', '15:30-16:25', '16:30-17:25', '17:30-18:25',
];

// Map course color names to Tailwind bg classes
const COLOR_MAP = {
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-400',
  blue: 'bg-blue-500',
  teal: 'bg-teal-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-400',
  rose: 'bg-rose-400',
  amber: 'bg-amber-500',
  cyan: 'bg-cyan-400',
  violet: 'bg-violet-500',
};

export function TimetableView({ onClose, courses }) {
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { day, slotIndex }

  const { data: timetableRows = [], isLoading } = useTimetable();
  const { data: settings } = useSettings();
  const upsertSlot = useUpsertTimetableSlot();
  const deleteSlot = useDeleteTimetableSlot();

  const activeDays = settings?.allow_weekend_classes ? ALL_DAYS : WEEKDAYS;

  // Build schedule lookup: schedule[day][slotIndex] = row | null
  const schedule = useMemo(() => {
    const s = {};
    activeDays.forEach(d => {
      s[d] = Array(TIMES.length).fill(null);
    });
    timetableRows.forEach(row => {
      if (s[row.day]) {
        s[row.day][row.slot_index] = row;
      }
    });
    return s;
  }, [timetableRows, activeDays]);

  const courseMap = useMemo(() => {
    const m = {};
    courses.forEach(c => { m[c.code] = c; });
    return m;
  }, [courses]);

  const handleCellClick = (day, slotIndex) => {
    if (!editMode) return;
    setEditTarget({ day, slotIndex });
  };

  const handleAssign = async (courseCode, room = '') => {
    if (!editTarget) return;
    await upsertSlot.mutateAsync({
      day: editTarget.day,
      slot_index: editTarget.slotIndex,
      course_code: courseCode,
      room,
      span: 1,
    });
    setEditTarget(null);
  };

  const handleClearSlot = async (day, slotIndex) => {
    await deleteSlot.mutateAsync({ day, slot_index: slotIndex });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 px-3 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Weekly Timetable</h2>
          <p className="text-indigo-100 text-sm">
            {editMode ? '✏️ Edit mode — click a cell to assign a subject' : 'Semester schedule'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditMode(!editMode); setEditTarget(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${editMode
                ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
                : 'text-white hover:bg-white/20 border border-white/30'
              }`}
          >
            {editMode ? <CheckSquare size={16} /> : <Pencil size={16} />}
            {editMode ? 'Done Editing' : 'Edit'}
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Assign Course Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Assign Subject</h3>
                <p className="text-xs text-gray-500">{editTarget.day} · {TIMES[editTarget.slotIndex]}</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {courses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Add subjects in Profile first.</p>
            ) : (
              <div className="space-y-2">
                {courses.map(course => (
                  <button
                    key={course.code}
                    onClick={() => handleAssign(course.code)}
                    disabled={upsertSlot.isPending}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${COLOR_MAP[course.color] || 'bg-indigo-500'}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{course.code}</div>
                      <div className="text-xs text-gray-500">{course.name}</div>
                    </div>
                    {upsertSlot.isPending && <Loader2 size={14} className="ml-auto animate-spin text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="overflow-x-auto sleek-scrollbar">
          <table className="w-full border-collapse table-fixed" style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th className="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 px-2 py-3 text-xs font-semibold text-gray-700" style={{ width: '70px' }} />
                {TIMES.map((time, idx) => (
                  <th key={idx} className="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 px-2 py-3 text-xs font-semibold text-gray-600" style={{ width: 'calc((100% - 70px) / 10)' }}>
                    <div className="whitespace-nowrap">{time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeDays.map(day => (
                <tr key={day}>
                  <td className="bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-200 px-2 py-4 text-center font-bold text-sm">
                    {day}
                  </td>
                  {TIMES.map((_, slotIdx) => {
                    const slot = schedule[day][slotIdx];
                    const course = slot ? courseMap[slot.course_code] : null;
                    const colorClass = course ? (COLOR_MAP[course.color] || 'bg-indigo-500') : '';

                    if (!slot) {
                      return (
                        <td
                          key={slotIdx}
                          onClick={() => handleCellClick(day, slotIdx)}
                          className={`border border-gray-200 transition-colors ${editMode
                              ? 'bg-indigo-50/40 hover:bg-indigo-100 cursor-pointer'
                              : 'bg-gradient-to-br from-gray-50 to-gray-100'
                            }`}
                        >
                          {editMode && (
                            <div className="flex items-center justify-center h-full min-h-[80px] text-indigo-300 text-xs">
                              +
                            </div>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td
                        key={slotIdx}
                        colSpan={slot.span || 1}
                        className="border border-gray-200 p-0 relative group"
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className={`w-full h-full min-h-[80px] ${colorClass} text-white px-1 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:z-10 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-50`}
                            >
                              <div className="flex flex-col items-center justify-center h-full">
                                {slot.room && (
                                  <div className="text-[10px] opacity-80 mb-0.5">{slot.room}</div>
                                )}
                                <div className="font-bold text-xs mb-0.5">{slot.course_code}</div>
                                <div className="text-[10px] opacity-80 line-clamp-1">{course?.name || ''}</div>
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0 overflow-hidden" sideOffset={8}>
                            <div className={`${colorClass} px-4 py-3`}>
                              <div className="text-white font-bold text-lg">{slot.course_code}</div>
                              <div className="text-white text-sm opacity-90">{course?.name || ''}</div>
                            </div>
                            <div className="p-4 space-y-3 bg-white">
                              {slot.room && (
                                <div className="flex items-start gap-2">
                                  <div className="text-gray-500 text-xs font-medium min-w-[60px]">Location:</div>
                                  <div className="text-gray-900 text-sm font-medium">{slot.room}</div>
                                </div>
                              )}
                              <div className="flex items-start gap-2">
                                <div className="text-gray-500 text-xs font-medium min-w-[60px]">Day:</div>
                                <div className="text-gray-900 text-sm">{day}</div>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="text-gray-500 text-xs font-medium min-w-[60px]">Time:</div>
                                <div className="text-gray-900 text-sm">{TIMES[slotIdx]}</div>
                              </div>
                              {editMode && (
                                <button
                                  onClick={() => handleClearSlot(day, slotIdx)}
                                  disabled={deleteSlot.isPending}
                                  className="mt-1 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                >
                                  {deleteSlot.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                  Remove from timetable
                                </button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {timetableRows.length === 0 && !isLoading && (
        <div className="px-6 py-4 bg-blue-50 border-t border-gray-200 text-center">
          <p className="text-sm text-blue-600 font-medium">
            Your timetable is empty — click <strong>Edit</strong> to start adding classes!
          </p>
        </div>
      )}
    </div>
  );
}