'use client'
import { ThemeToggle } from './ThemeToggle'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export function Header() {
  const queryClient = useQueryClient()

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight">💰 FinDash</span>
          <span className="text-xs text-gray-500 hidden sm:block">Market Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries()}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Refresh all data"
          >
            <RefreshCw size={16} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
