import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import Pillars from '../components/Pillars.jsx'
import AboutSnapshot from '../components/AboutSnapshot.jsx'
import FeaturedWork from '../components/FeaturedWork.jsx'
import HomepageReel from '../components/HomepageReel.jsx'
import ServicesRows from '../components/ServicesRows.jsx'
import TestimonialCarousel from '../components/TestimonialCarousel.jsx'
import ManifestoQuote from '../components/ManifestoQuote.jsx'
import BrandsTicker from '../components/BrandsTicker.jsx'
import FinalCTA from '../components/FinalCTA.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Pillars />
      <AboutSnapshot />
      <FeaturedWork />
      <HomepageReel />
      <ServicesRows />
      <TestimonialCarousel />
      <ManifestoQuote />
      <BrandsTicker />
      <FinalCTA />
    </>
  )
}
