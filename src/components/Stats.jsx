import React from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { calculateAttendanceStats, isAttendanceLow, calculateSkipInfo } from '../utils/calculations';

export const Stats = ({ courses, attendance }) => {
  const courseStats = courses.map(course => {
    const stats = calculateAttendanceStats(attendance, course.code);
    const isLow = stats.total > 0 && isAttendanceLow(stats.percentage, course.required);
    const skipInfo = stats.total > 0 ? calculateSkipInfo(stats.present, stats.total, course.required) : null;
    return { course, stats, isLow, skipInfo };
  });

  const hasAnyData = courseStats.some(cs => cs.stats.total > 0);
  const lowCount = courseStats.filter(cs => cs.isLow).length;

  const overall = courseStats.reduce(
    (acc, { stats }) => ({ present: acc.present + stats.present, total: acc.total + stats.total }),
    { present: 0, total: 0 }
  );
  const overallPct = overall.total > 0 ? ((overall.present / overall.total) * 100).toFixed(1) : null;

  return (
    <div className="space-y-2">
      {/* Summary row */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Attendance</p>
            <p className={`text-2xl font-bold mt-1 ${lowCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overallPct !== null ? `${overallPct}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {lowCount > 0
                ? `${lowCount} course${lowCount > 1 ? 's' : ''} need attention`
                : hasAnyData ? 'All courses on track' : 'No data yet — start marking attendance'}
            </p>
          </div>
          {lowCount > 0
            ? <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
            : <TrendingUp className="text-green-500 flex-shrink-0" size={32} />
          }
        </div>
      </div>

      {/* Per-course breakdown */}
      {hasAnyData && (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {courseStats.map(({ course, stats, isLow, skipInfo }) => (
            <div key={course.code} className="px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-900 truncate">{course.code}</span>
                  {isLow && <AlertCircle size={13} className="text-red-500 flex-shrink-0" />}
                </div>
                <div className="mt-1.5 h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, parseFloat(stats.percentage))}%` }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-green-700'}`}>
                  {stats.percentage}%
                </div>
                <div className="text-xs text-gray-400">{stats.present}/{stats.total}</div>
                {skipInfo && (
                  <div className={`text-xs mt-0.5 font-medium ${skipInfo.type === 'skip' ? 'text-gray-400' : 'text-red-500'}`}>
                    {skipInfo.type === 'skip'
                      ? `skip ${skipInfo.count} more`
                      : `attend ${skipInfo.count} more`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
