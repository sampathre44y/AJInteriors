import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Instagram } from 'lucide-react';
import { MOCK_TEAM } from '../lib/data';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

function AutoSlidingImage({ images, projectId }: { images: string[], projectId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="aspect-[4/3] overflow-hidden cursor-pointer relative"
      onClick={() => navigate(`/portfolio?project=${projectId}`)}
    >
      {images.map((img, idx) => (
        <img 
          key={idx}
          src={img} 
          alt={`Project view ${idx + 1}`} 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100' : 'opacity-0'} hover:scale-105`}
          referrerPolicy="no-referrer"
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(2));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentProjects(projectsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2000" 
            alt="Minimalist Interior" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-dark/30" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl text-cream mb-6"
          >
            Thoughtful Designs for Modern Homes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-cream/80 text-lg md:text-xl font-light tracking-wide mb-10"
          >
            Elevating spaces in Armoor, Nirmal, and Nizamabad.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Link 
              to="/portfolio" 
              className="inline-flex items-center space-x-3 bg-cream text-dark px-8 py-4 uppercase tracking-widest text-sm hover:bg-earth hover:text-cream transition-colors duration-300"
            >
              <span>View Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 md:px-12 bg-cream">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl mb-8">The Minimal Premium Standard</h2>
          <p className="text-dark-muted leading-relaxed text-lg md:text-xl font-light">
            We believe in the power of restraint. Our designs prioritize generous white space, 
            sophisticated textures, and a mature warmth that transforms houses into sanctuaries. 
            Every project is a careful curation of light, material, and form.
          </p>
        </div>
      </section>

      {/* Recent Works & Testimonials */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-3xl md:text-5xl">Recent Works</h2>
            <Link to="/portfolio" className="hidden md:flex items-center space-x-2 text-sm tracking-widest uppercase hover:text-earth transition-colors">
              <span>See All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-32">
            {recentProjects.map((project, index) => (
              <div key={project.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}>
                <div className="w-full md:w-1/2">
                  <AutoSlidingImage images={project.images} projectId={project.id} />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <span className="text-xs tracking-widest uppercase text-earth mb-4 block">{project.room_type}</span>
                  <h3 className="text-3xl md:text-4xl mb-6">{project.title}</h3>
                  <p className="text-dark-muted font-light leading-relaxed mb-8 text-lg">
                    {project.description}
                  </p>
                  <blockquote className="border-l-2 border-earth pl-6 italic text-dark/80 font-serif text-xl leading-relaxed">
                    {project.testimonial}
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center md:hidden">
            <Link to="/portfolio" className="inline-flex items-center space-x-2 text-sm tracking-widest uppercase hover:text-earth transition-colors">
              <span>See All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Highlight Section */}
      <section className="py-24 px-6 md:px-12 bg-dark text-cream text-center">
        <div className="max-w-3xl mx-auto">
          <Instagram className="w-12 h-12 mx-auto mb-6 text-earth" />
          <h2 className="text-3xl md:text-5xl mb-6">Follow Our Journey</h2>
          <p className="text-cream/80 font-light text-lg mb-10">
            Discover our latest projects, behind-the-scenes moments, and daily design inspiration on Instagram.
          </p>
          <a 
            href="https://www.instagram.com/ajinteriordesignstudio" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center space-x-3 bg-cream text-dark px-8 py-4 uppercase tracking-widest text-sm hover:bg-earth hover:text-cream transition-colors duration-300"
          >
            <span>@ajinteriordesignstudio</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 px-6 md:px-12 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl mb-6">Meet the Team</h2>
            <p className="text-dark-muted font-light max-w-2xl mx-auto text-lg">
              The creative minds behind AJ Interior Design Studio. We bring passion, 
              precision, and a shared vision for elevated living to every project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {MOCK_TEAM.map((member) => (
              <div key={member.id} className="text-center group">
                <div className="mb-6 overflow-hidden aspect-[3/4] max-w-sm mx-auto">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-2xl mb-2">{member.name}</h3>
                <p className="text-sm tracking-widest uppercase text-earth">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
