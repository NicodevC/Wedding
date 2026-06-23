import type { Guest } from '../types/database'

interface Props {
  matchedGuest: Guest
  currentGuest: Guest | null
  onClose: () => void
}

export default function MatchPopup({ matchedGuest, currentGuest, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-match-in">
        {/* Confetti header */}
        <div className="text-5xl mb-4">🎉💕🎉</div>

        <h2 className="text-3xl font-black bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent mb-1">
          ¡Es un Match!
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          A ambos se les gustaron — algo puede pasar hoy 😉
        </p>

        {/* Photos */}
        <div className="flex justify-center gap-4 mb-6">
          {currentGuest?.photo_url ? (
            <img
              src={currentGuest.photo_url}
              alt={currentGuest.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-rose-400 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-violet-200 border-4 border-rose-400 shadow-lg flex items-center justify-center text-4xl">
              👤
            </div>
          )}

          <div className="flex items-center text-2xl -mx-2 z-10">💞</div>

          {matchedGuest.photo_url ? (
            <img
              src={matchedGuest.photo_url}
              alt={matchedGuest.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-violet-400 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-200 to-rose-200 border-4 border-violet-400 shadow-lg flex items-center justify-center text-4xl">
              👤
            </div>
          )}
        </div>

        <p className="text-gray-700 font-semibold text-lg mb-1">
          Tú y <span className="text-violet-600">{matchedGuest.name}</span>
        </p>
        {matchedGuest.how_they_know && (
          <p className="text-gray-400 text-sm mb-6">
            {matchedGuest.how_they_know}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          ¡Ir a conocerle! 💬
        </button>
      </div>
    </div>
  )
}
