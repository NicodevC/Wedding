import { Link, useLocation } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  showNav?: boolean
}

export default function Layout({ children, showNav = true }: Props) {
  const location = useLocation()

  const navItems = [
    { to: '/', icon: '🏠', label: 'Inicio' },
    { to: '/swipe', icon: '💘', label: 'Swipe' },
    { to: '/matches', icon: '💞', label: 'Matches' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-500 to-violet-600 text-white px-4 py-3 shadow-md flex-shrink-0">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <span className="text-lg font-black tracking-tight">
            💍 Solteros de la Boda
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-sm mx-auto px-4 py-4 h-full">
          {children}
        </div>
      </main>

      {/* Bottom nav */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 shadow-lg">
          <div className="max-w-sm mx-auto flex">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors
                    ${active ? 'text-rose-600' : 'text-gray-400'}
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-semibold">{item.label}</span>
                  {active && (
                    <div className="absolute bottom-0 w-8 h-0.5 bg-gradient-to-r from-rose-500 to-violet-600 rounded-t-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
