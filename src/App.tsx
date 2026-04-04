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
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="AJ Studio" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-12 items-center">
          <Link to="/" className="text-sm tracking-widest uppercase hover:text-earth transition-colors">Home</Link>
          <Link to="/portfolio" className="text-sm tracking-widest uppercase hover:text-earth transition-colors">Portfolio</Link>
          <Link to="/book" className="text-sm tracking-widest uppercase hover:text-earth transition-colors">Get an Estimate</Link>
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
            <Link to="/book" className="text-lg font-serif tracking-wide">Get an Estimate</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-cream py-20 px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="font-serif text-2xl mb-6">AJ Interior Design Studio</h3>
          <p className="text-cream/70 font-light max-w-sm">
            Thoughtful designs for modern homes. Best interior designers in Armoor, Nirmal, Nizamabad.
          </p>
        </div>
        <div>
          <h4 className="text-sm tracking-widest uppercase mb-6 text-earth">Contact</h4>
          <p className="text-cream/70 font-light mb-2">MJ hospital road, Armoor, India 503224</p>
          <p className="text-cream/70 font-light">Call us: 94943 38332</p>
        </div>
        <div>
          <h4 className="text-sm tracking-widest uppercase mb-6 text-earth">Links</h4>
          <div className="flex flex-col space-y-2">
            <a href="https://www.instagram.com/ajinteriordesignstudio" target="_blank" rel="noreferrer" className="text-cream/70 hover:text-cream transition-colors font-light">
              Instagram
            </a>
            <Link to="/admin" className="text-cream/70 hover:text-cream transition-colors font-light">
              Admin Portal
            </Link>
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
