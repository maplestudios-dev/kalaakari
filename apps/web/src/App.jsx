import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Grain from './components/Grain.jsx'
import SEOHead from './components/SEOHead.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Services from './pages/Services.jsx'
import Work from './pages/Work.jsx'
import CaseStudy from './pages/CaseStudy.jsx'
import Contact from './pages/Contact.jsx'
import Reel from './pages/Reel.jsx'
import Careers from './pages/Careers.jsx'
import Press from './pages/Press.jsx'
import Journal from './pages/Journal.jsx'
import JournalPost from './pages/JournalPost.jsx'

export default function App() {
  return (
    <>
      <Grain />
      <SEOHead />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/about"    element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work"          element={<Work />} />
          <Route path="/work/:slug"    element={<CaseStudy />} />
          <Route path="/reel"          element={<Reel />} />
          <Route path="/journal"       element={<Journal />} />
          <Route path="/journal/:slug" element={<JournalPost />} />
          <Route path="/careers"       element={<Careers />} />
          <Route path="/press"         element={<Press />} />
          <Route path="/contact"       element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
