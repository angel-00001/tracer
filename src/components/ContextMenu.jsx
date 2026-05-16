import React, { useEffect, useRef } from 'react';
import { Check, X, Plus, Umbrella, Ban, Trash2 } from 'lucide-react';
import { STATUS_CONFIG } from '../utils/calculations';

const MENU_ITEMS = [
    { status: 'present', icon: Check, label: 'Present' },
    { status: 'absent', icon: X, label: 'Absent' },
    { status: 'extra_class', icon: Plus, label: 'Extra Class' },
    { status: 'holiday', icon: Umbrella, label: 'Public Holiday' },
    { status: 'cancelled', icon: Ban, label: 'Cancelled' },
    { status: null, icon: Trash2, label: 'Clear', isDanger: true },
];

/**
 * A floating context menu.
 * Props:
 *   x, y        – screen position to anchor to
 *   current     – current status of the row
 *   onSelect    – called with (status | null)
 *   onClose     – called when dismissed without selecting
 */
export function ContextMenu({ x, y, current, onSelect, onClose }) {
    const menuRef = useRef(null);

    // Clamp to viewport
    const MENU_W = 180;
    const MENU_H = 260;
    const left = Math.min(x, window.innerWidth - MENU_W - 8);
    const top = Math.min(y, window.innerHeight - MENU_H - 8);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick, { passive: true });
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            style={{ position: 'fixed', top, left, zIndex: 1000, width: MENU_W }}
            className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-100"
        >
            {MENU_ITEMS.map(({ status, icon: Icon, label, isDanger }) => {
                const cfg = status ? STATUS_CONFIG[status] : null;
                const isActive = current === status;
                return (
                    <button
                        key={label}
                        onClick={() => { onSelect(status); onClose(); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
              ${isActive ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}
              ${isDanger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700'}
            `}
                    >
                        <Icon size={15} className={isDanger ? 'text-red-400' : cfg ? cfg.color : 'text-gray-400'} />
                        <span>{cfg?.emoji ? `${cfg.emoji} ` : ''}{label}</span>
                        {isActive && <span className="ml-auto text-gray-400 text-xs">✓</span>}
                    </button>
                );
            })}
        </div>
    );
}
