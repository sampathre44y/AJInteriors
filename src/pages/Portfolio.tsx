import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { auth, db, storage } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { cn } from '../lib/utils';
import MediaRenderer from '../components/MediaRenderer';

function ProjectGallery({ images, projectId, isAdmin, aspectClass = "aspect-[3/4]" }: { images: string[], projectId: string, isAdmin: boolean, aspectClass?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextImage = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, 'projects', projectId), {
        images: arrayUnion(downloadUrl)
      });
      
      setCurrentIndex(images.length);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please check your permissions.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden group rounded-[2.5rem] shadow-2xl shadow-dark/5">
      <div className={cn("overflow-hidden rounded-[2.5rem]", aspectClass)}>
        <MediaRenderer 
          src={images[currentIndex]} 
          alt="Project view" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-[2.5rem]" 
        />
      </div>

      {isAdmin && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-dark text-cream p-2 rounded-full shadow-lg hover:bg-dark/90 transition-colors"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Portfolio() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [projects, setProjects] = useState<any[]>([]);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const projectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
      setFirebaseError(null);
    }, (error) => {
      console.error('Projects list error:', error);
      setFirebaseError('Missing permissions to read projects. Please update your Firebase Security Rules.');
    });
    
    return () => {
      unsubscribeAuth();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('project');
    if (projectId && projectRefs.current[projectId]) {
      setTimeout(() => {
        projectRefs.current[projectId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500); // Small delay to allow rendering
    }
  }, [location.search, selectedFilters, projects]);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.room_type)))] as string[];
  
  const toggleFilter = (cat: string) => {
    if (cat === 'All') {
      setSelectedFilters(['All']);
      return;
    }

    setSelectedFilters(prev => {
      const newFilters = prev.filter(f => f !== 'All');
      if (newFilters.includes(cat)) {
        const filtered = newFilters.filter(f => f !== cat);
        return filtered.length === 0 ? ['All'] : filtered;
      } else {
        return [...newFilters, cat];
      }
    });
  };

  const filteredProjects = selectedFilters.includes('All') 
    ? projects 
    : projects.filter(p => selectedFilters.includes(p.room_type));

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-6 md:px-12">
      {firebaseError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-lg" role="alert">
            <p className="font-bold">Database Permission Error</p>
            <p>{firebaseError}</p>
          </div>
        </div>
      )}

      {/* Top Labels */}
      <div className="max-w-[1600px] mx-auto flex justify-between items-start mb-12">
        <span className="text-[10px] tracking-[0.5em] uppercase text-dark-muted font-medium">Gallery</span>
        <span className="text-[10px] tracking-[0.5em] uppercase text-dark-muted font-medium">our projects</span>
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-20">
        {/* Left Column: Image Gallery (Masonry Style) */}
        <div className="lg:w-3/5">
          <div className="columns-1 md:columns-2 gap-8 space-y-12">
            {filteredProjects.map((project, index) => {
              // Determine aspect ratio based on index for a dynamic "Photos App" feel
              const aspectRatios = [
                "aspect-[3/4]",   // Vertical
                "aspect-square",  // Cube
                "aspect-[4/5]",   // Tall
                "aspect-[3/2]",   // Horizontal
                "aspect-square",  // Cube
                "aspect-[2/3]"    // Very Tall
              ];
              const aspectClass = aspectRatios[index % aspectRatios.length];

              return (
                <motion.div 
                  key={project.id}
                  ref={(el) => {
                    if (project.id) {
                      projectRefs.current[project.id as string] = el;
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (index % 2) * 0.1 }}
                  className="relative break-inside-avoid"
                >
                  <ProjectGallery 
                    images={project.images} 
                    projectId={project.id} 
                    isAdmin={isAdmin} 
                    aspectClass={aspectClass}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Project Details & Navigation */}
        <div className="lg:w-2/5 flex flex-col justify-between">
          <div className="space-y-6 lg:sticky lg:top-32">
            {filteredProjects.map((project) => (
              <motion.div 
                key={`title-${project.id}`}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="group border border-dark/5 p-8 md:p-12 hover:bg-dark transition-all duration-500 cursor-pointer rounded-[2rem]"
                onClick={() => {
                  projectRefs.current[project.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="flex gap-6 items-start">
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-2xl border border-dark/5">
                    <MediaRenderer 
                      src={project.images?.[0]} 
                      alt={project.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl md:text-3xl font-serif text-dark group-hover:text-cream transition-colors duration-500 leading-tight">
                        {project.title}
                      </h2>
                      <Plus className="w-5 h-5 text-dark/20 group-hover:text-cream/40 transition-colors" />
                    </div>
                    <div className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-700 ease-in-out">
                      <p className="mt-4 text-cream/70 font-light text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Right Navigation Links */}
          <div className="mt-40 lg:mt-auto flex justify-end gap-12 text-[10px] tracking-[0.4em] uppercase text-dark-muted font-medium">
            <a href="/" className="hover:text-earth transition-colors">Home</a>
            <a href="/portfolio" className="hover:text-earth transition-colors">Portfolio</a>
            <a href="/book" className="hover:text-earth transition-colors">Get in touch</a>
          </div>
        </div>
      </div>
    </div>
  );
}
