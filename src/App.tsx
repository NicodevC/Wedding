import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Swipe from './pages/Swipe'
import Matches from './pages/Matches'
import Admin from './pages/Admin'

function RequireUser({ children }: { children: React.ReactNode }) {
  const currentUser = localStorage.getItem('wedding_user')
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/setup"
          element={
            <RequireUser>
              <Setup />
            </RequireUser>
          }
        />
        <Route
          path="/swipe"
          element={
            <RequireUser>
              <Swipe />
            </RequireUser>
          }
        />
        <Route
          path="/matches"
          element={
            <RequireUser>
              <Matches />
            </RequireUser>
          }
        />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
