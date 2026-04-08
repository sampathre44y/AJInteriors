import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { MOCK_TEAM } from '../lib/data';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import MediaRenderer from '../components/MediaRenderer';

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
      className="aspect-[4/3] overflow-hidden cursor-pointer relative rounded-[2.5rem]"
      onClick={() => navigate(`/portfolio?project=${projectId}`)}
    >
      {images.map((img, idx) => (
        <MediaRenderer 
          key={idx}
          src={img} 
          alt={`Project view ${idx + 1}`} 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100' : 'opacity-0'} hover:scale-105 rounded-[2.5rem]`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(2));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentProjects(projectsData);
      setFirebaseError(null);
    }, (error) => {
      console.error('Projects list error:', error);
      setFirebaseError('Missing permissions to read projects. Please update your Firebase Security Rules.');
    });

    const teamQ = query(collection(db, 'team'), orderBy('createdAt', 'asc'));
    const unsubscribeTeam = onSnapshot(teamQ, (snapshot) => {
      const teamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(teamData);
      setFirebaseError(null);
    }, (error) => {
      console.error('Team list error:', error);
      setFirebaseError('Missing permissions to read team members. Please update your Firebase Security Rules.');
    });

    return () => {
      unsubscribe();
      unsubscribeTeam();
    };
  }, []);

  return (
    <div className="w-full">
      {firebaseError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-lg" role="alert">
            <p className="font-bold">Database Permission Error</p>
            <p>{firebaseError}</p>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Left Edge Socials */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col">
          <a href="https://www.facebook.com/share/1Bn6tgZi73/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="bg-[#3b5998] text-white p-3 hover:w-16 transition-all w-12 flex justify-end">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="https://www.instagram.com/ajinteriordesignstudio?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white p-3 hover:w-16 transition-all w-12 flex justify-end">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="https://youtube.com/@ajinteriordesignstudio?si=7n7oS6GKJoBh6uOg" target="_blank" rel="noreferrer" className="bg-[#ff0000] text-white p-3 hover:w-16 transition-all w-12 flex justify-end">
            <Youtube className="w-6 h-6" />
          </a>
          <a href="https://wa.me/919494338332" target="_blank" rel="noreferrer" className="bg-[#25D366] text-white p-3 hover:w-16 transition-all w-12 flex justify-end">
            <MessageCircle className="w-6 h-6" />
          </a>
        </div>

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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="inline-block mb-10"
          >
            <p className="text-cream/90 text-xs md:text-sm font-medium tracking-[0.3em] uppercase px-8 py-3 border border-cream/10 bg-white/5 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              Elevating spaces in Armoor, Nirmal, and Nizamabad
            </p>
          </motion.div>
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

      {/* Get in Touch Card */}
      <section className="py-16 px-6 md:px-12 bg-cream flex justify-center">
        <Link 
          to="/book" 
          className="group relative overflow-hidden bg-white border border-taupe/30 p-10 md:p-16 max-w-3xl w-full flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-[3rem]"
        >
          <div className="absolute inset-0 bg-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out rounded-[3rem]" />
          <div className="relative z-10 group-hover:text-cream transition-colors duration-500">
            <h2 className="text-3xl md:text-4xl mb-4 font-serif">Start Your Project</h2>
            <p className="text-dark-muted group-hover:text-cream/80 font-light mb-8 transition-colors duration-500">
              Get a personalized estimate and let's build your dream home together.
            </p>
            <span className="inline-flex items-center space-x-2 text-sm tracking-widest uppercase text-earth group-hover:text-cream transition-colors duration-500">
              <span>Get in touch</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
            </span>
          </div>
        </Link>
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
            {teamMembers.length > 0 ? teamMembers.map((member) => (
              <div key={member.id} className="text-center group">
                <div className="mb-6 overflow-hidden aspect-[3/4] max-w-sm mx-auto rounded-[2.5rem]">
                  <MediaRenderer 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 rounded-[2.5rem]"
                  />
                </div>
                <h3 className="text-2xl mb-2">{member.name}</h3>
                <p className="text-sm tracking-widest uppercase text-earth">{member.role}</p>
              </div>
            )) : MOCK_TEAM.map((member) => (
              <div key={member.id} className="text-center group">
                <div className="mb-6 overflow-hidden aspect-[3/4] max-w-sm mx-auto rounded-[2.5rem]">
                  <MediaRenderer 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 rounded-[2.5rem]"
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
