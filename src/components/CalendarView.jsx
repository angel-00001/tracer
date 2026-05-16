import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  STATUS_CONFIG,
  getTodayAttendanceStatus,
  getWeekdaysInRange,
  formatDate
} from '../utils/calculations';

const MENU_ITEMS = [
  { status: 'present', emoji: '✅', label: 'Present' },
  { status: 'extra_class', emoji: '➕', label: 'Extra Class' },
  { status: 'absent', emoji: '❌', label: 'Absent' },
  { status: 'holiday', emoji: '🏖️', label: 'Holiday' },
  { status: 'cancelled', emoji: '🚫', label: 'Cancelled' },
  { status: null, emoji: '✕', label: 'Clear', danger: true },
];

export const CalendarView = ({ courses, attendance, onMarkAttendance, syncing }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [openCell, setOpenCell] = useState(null); // `${courseCode}-${date}`

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const weekdays = getWeekdaysInRange(
    startOfMonth.toISOString().split('T')[0],
    endOfMonth.toISOString().split('T')[0]
  );

  const handlePrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSelect = (courseCode, date, status) => {
    onMarkAttendance(courseCode, date, status);
    setOpenCell(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">Calendar View</h2>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs sticky left-0 bg-gray-50">
                Course
              </th>
              {weekdays.map(date => (
                <th key={date} className="text-center py-2 px-2 font-medium text-gray-700 text-xs min-w-[50px]">
                  {formatDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.code} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 sticky left-0 bg-white">
                  <div className="text-xs font-medium text-gray-900">{course.code}</div>
                </td>
                {weekdays.map(date => {
                  const cellKey = `${course.code}-${date}`;
                  const status = getTodayAttendanceStatus(attendance, course.code, date);
                  const isSyncing = syncing[cellKey];
                  const cfg = status ? STATUS_CONFIG[status] : null;

                  return (
                    <td key={date} className="py-1 px-1">
                      <Popover
                        open={openCell === cellKey}
                        onOpenChange={open => setOpenCell(open ? cellKey : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            disabled={isSyncing}
                            className={`w-full h-8 rounded flex items-center justify-center text-xs transition-all focus:outline-none
                              ${cfg
                                ? `${cfg.bg} ${cfg.hoverBg} ${cfg.color}`
                                : 'hover:bg-gray-100 border border-gray-200'
                              }`}
                          >
                            {isSyncing
                              ? <Loader2 size={12} className="animate-spin text-gray-400" />
                              : cfg ? cfg.emoji : null
                            }
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-1" align="center" sideOffset={4}>
                          {MENU_ITEMS.map(({ status: s, emoji, label, danger }) => (
                            <button
                              key={label}
                              onClick={() => handleSelect(course.code, date, s)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left rounded-md transition-colors
                                ${status === s ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}
                                ${danger ? 'text-red-500' : 'text-gray-700'}
                              `}
                            >
                              <span>{emoji}</span>
                              <span>{label}</span>
                              {status === s && <span className="ml-auto text-gray-400 text-xs">✓</span>}
                            </button>
                          ))}
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
    </div>
  );
};
