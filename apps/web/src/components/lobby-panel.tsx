// apps/web/src/components/lobby-panel.tsx
'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { timeControls, wagerOptions } from "@/lib/game-config";

export function LobbyPanel() {
    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Настройки лобби</h2>
            
            <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Доступное время:</label>
                <div className="flex gap-2">
                    {timeControls.map(time => (
                        <span key={time} className="px-2 py-1 bg-gray-700 rounded text-xs text-white">
                            {time} мин
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Варианты ставок:</label>
                <div className="flex gap-2">
                    {wagerOptions.map(wager => (
                        <span key={wager} className="px-2 py-1 bg-gray-700 rounded text-xs text-white">
                            {wager} C4C
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <ConnectButton />
            </div>
        </div>
    );
}