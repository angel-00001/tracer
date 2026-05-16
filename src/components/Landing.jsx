import React from 'react';

export function Landing({ onGetStarted }) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Nav */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <span className="font-semibold text-gray-900 text-lg">Tracer</span>
                <button
                    onClick={onGetStarted}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    Sign in
                </button>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto w-full py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    Track your attendance,<br />the simple way.
                </h1>
                <p className="text-gray-500 text-base mb-2">
                    Tracer is a no-frills tool to manually log and track your college attendance across subjects.
                </p>
                <p className="text-gray-400 text-sm mb-10">
                    Know exactly where you stand before it's too late.
                </p>

                <button
                    onClick={onGetStarted}
                    className="bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full max-w-xs"
                >
                    Get started
                </button>

                <p className="text-xs text-gray-400 mt-4">Free · No ads · Just attendance</p>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Tracer, built.</p>
            </footer>
        </div>
    );
}
