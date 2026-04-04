import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function ProjectGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden group">
      <img 
        src={images[currentIndex]} 
        alt="Project view" 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" 
        referrerPolicy="no-referrer" 
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage} 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-cream/80 hover:bg-cream p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-dark" />
          </button>
          <button 
            onClick={nextImage} 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-cream/80 hover:bg-cream p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-dark" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-cream' : 'bg-cream/50 hover:bg-cream/80'}`} 
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState<any[]>([]);
  const location = useLocation();
  const projectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('project');
    if (projectId && projectRefs.current[projectId]) {
      setTimeout(() => {
        projectRefs.current[projectId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500); // Small delay to allow rendering
    }
  }, [location.search, filter, projects]);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.room_type)))];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.room_type === filter);

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl mb-6">Selected Works</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm tracking-widest uppercase pb-1 border-b-2 transition-colors ${
                filter === cat ? 'border-dark text-dark' : 'border-transparent text-dark-muted hover:text-dark'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {filteredProjects.map((project, index) => (
          <motion.div 
            key={project.id}
            ref={(el) => (projectRefs.current[project.id] = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <ProjectGallery images={project.images} />
            <div className="mt-6">
              <span className="text-xs tracking-widest uppercase text-earth mb-2 block">{project.room_type}</span>
              <h3 className="text-2xl mb-3">{project.title}</h3>
              <p className="text-dark-muted font-light leading-relaxed">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
