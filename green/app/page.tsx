import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'
import ImpactStats from '@/components/ImpactStats'
import AboutSection from '@/components/AboutSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <ImpactStats />
      <AboutSection />
      <Footer />
    </main>
  )
}
