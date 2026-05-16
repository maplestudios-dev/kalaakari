import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AcceptInvite from './pages/AcceptInvite.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PortfolioPage from './pages/Portfolio.jsx'
import Submissions from './pages/Submissions.jsx'
import UsersPage from './pages/Users.jsx'
import AuditPage from './pages/Audit.jsx'
import CopyPage from './pages/Copy.jsx'
import VideoPage from './pages/Video.jsx'
import SeoPage from './pages/Seo.jsx'
import TestimonialsPage from './pages/Testimonials.jsx'
import PressPage from './pages/Press.jsx'
import BlogPage from './pages/Blog.jsx'
import Shell from './components/Shell.jsx'

function Protected({ children }) {
  const t = localStorage.getItem('kalaakaari_token')
  const loc = useLocation()
  if (!t) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route element={<Protected><Shell /></Protected>}>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/portfolio"     element={<PortfolioPage />} />
        <Route path="/video"         element={<VideoPage />} />
        <Route path="/blog"          element={<BlogPage />} />
        <Route path="/testimonials"  element={<TestimonialsPage />} />
        <Route path="/press"         element={<PressPage />} />
        <Route path="/submissions"   element={<Submissions />} />
        <Route path="/copy"          element={<CopyPage />} />
        <Route path="/seo"           element={<SeoPage />} />
        <Route path="/users"         element={<UsersPage />} />
        <Route path="/audit"         element={<AuditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
