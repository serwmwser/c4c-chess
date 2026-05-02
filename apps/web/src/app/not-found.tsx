// apps/web/src/app/not-found.tsx
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-8">Страница не найдена</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
        Вернуться на главную
      </Link>
    </div>
  );
}