import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Home() {
  const navigate = useNavigate()
  const currentUser = localStorage.getItem('wedding_user')

  const handleEnter = () => {
    if (currentUser) {
      navigate('/swipe')
    } else {
      navigate('/login')
    }
  }

  return (
    <Layout showNav={!!currentUser}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center gap-6 py-8">
        {/* Hero */}
        <div className="animate-fade-in">
          <div className="text-7xl mb-4">💍</div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent leading-tight mb-2">
            Solteros del
            <br />
            Matrimonio
          </h1>
          <p className="text-gray-500 text-base max-w-xs mx-auto">
            El amor puede estar más cerca de lo que crees. ¿Quién sabe? A lo mejor hoy conoces a alguien especial 💕
          </p>
        </div>

        {/* Decorative rings */}
        <div className="flex gap-2 text-3xl">
          <span>💎</span>
          <span>👫</span>
          <span>💎</span>
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3 animate-slide-up">
          <button
            onClick={handleEnter}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
          >
            {currentUser ? `Continuar como ${currentUser} 💘` : 'Entrar a la fiesta ✨'}
          </button>

          {currentUser && (
            <button
              onClick={() => {
                localStorage.removeItem('wedding_user')
                navigate('/login')
              }}
              className="text-gray-400 text-sm py-2"
            >
              No soy {currentUser} — cambiar
            </button>
          )}
        </div>

        {/* Admin link */}
        <Link
          to="/admin"
          className="text-gray-300 text-xs mt-4 hover:text-gray-400 transition-colors"
        >
          Admin
        </Link>
      </div>
    </Layout>
  )
}
