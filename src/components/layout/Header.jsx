import React from 'react';

export default function Header() {
    return (
        <header className="p-4 bg-white border-b border-gray-200 flex items-center gap-4 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-800">Sistema de Horarios</h1>
                <span className="text-sm text-gray-500">- UPTEX</span>
            </div>
        </header>
    );
}