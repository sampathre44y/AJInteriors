import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

// Pages
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Booking from './pages/Booking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        scrolled ? 'bg-cream/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-4 group">
          <div className="relative">
            <img src="/logo.svg" alt="AJ Studio" className="h-12 md:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute -inset-2 bg-earth/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl md:text-2xl tracking-[0.2em] uppercase text-dark leading-none">AJ Studio</span>
            <span className="text-[8px] tracking-[0.4em] uppercase text-earth mt-1 font-bold">Interior Design</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-16 items-center">
          <Link to="/" className="text-[10px] tracking-[0.4em] uppercase hover:text-earth transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-earth transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/portfolio" className="text-[10px] tracking-[0.4em] uppercase hover:text-earth transition-colors relative group">
            Portfolio
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-earth transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/book" className="bg-dark text-cream px-8 py-3 text-[10px] tracking-[0.4em] uppercase hover:bg-earth transition-all duration-500 rounded-full">
            Get in touch
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-cream border-b border-taupe/20 py-8 px-6 flex flex-col space-y-6 md:hidden"
          >
            <Link to="/" className="text-lg font-serif tracking-wide">Home</Link>
            <Link to="/portfolio" className="text-lg font-serif tracking-wide">Portfolio</Link>
            <Link to="/book" className="text-lg font-serif tracking-wide">Get in touch</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-cream pt-32 pb-12 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-2">
            <span className="text-[10px] tracking-[0.6em] uppercase text-earth mb-8 block font-bold">The Studio</span>
            <h3 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">Crafting <br/> Timeless <br/> Spaces.</h3>
            <p className="text-cream/50 font-light max-w-sm text-lg leading-relaxed">
              We transform modern houses into sanctuaries through the power of restraint and sophisticated design.
            </p>
          </div>
          
          <div>
            <span className="text-[10px] tracking-[0.6em] uppercase text-earth mb-8 block font-bold">Connect</span>
            <div className="space-y-4">
              <p className="text-cream/70 font-light leading-relaxed">
                MJ hospital road, Armoor, <br/> India 503224
              </p>
              <p className="text-cream/70 font-light">94943 38332</p>
              <a href="mailto:hello@ajstudio.com" className="text-earth hover:text-cream transition-colors block font-light">hello@ajstudio.com</a>
            </div>
          </div>

          <div>
            <span className="text-[10px] tracking-[0.6em] uppercase text-earth mb-8 block font-bold">Explore</span>
            <div className="flex flex-col space-y-4">
              <Link to="/portfolio" className="text-cream/70 hover:text-cream transition-colors font-light">Portfolio</Link>
              <a href="https://www.instagram.com/ajinteriordesignstudio" target="_blank" rel="noreferrer" className="text-cream/70 hover:text-cream transition-colors font-light">Instagram</a>
              <Link to="/admin" className="text-cream/70 hover:text-cream transition-colors font-light">Admin Portal</Link>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-cream/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="font-serif italic text-2xl text-cream/20">AJ Studio</span>
            <span className="text-[8px] tracking-[0.4em] uppercase text-cream/20">© 2026 All Rights Reserved</span>
          </div>
          <div className="flex gap-8 text-[8px] tracking-[0.4em] uppercase text-cream/40">
            <span className="hover:text-cream cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-cream cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
