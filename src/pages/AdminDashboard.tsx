import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { GoogleGenAI } from '@google/genai';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Upload, Wand2, LogOut, Image as ImageIcon, Video, Trash2, Edit2 } from 'lucide-react';
import MediaRenderer from '../components/MediaRenderer';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'team'>('upload');
  
  // Library State
  const [projects, setProjects] = useState<any[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // Team State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamPhoto, setTeamPhoto] = useState<File | null>(null);
  const [teamPhotoPreview, setTeamPhotoPreview] = useState<string | null>(null);
  const [isPublishingTeam, setIsPublishingTeam] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // Upload State
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isVideo, setIsVideo] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [summary, setSummary] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [title, setTitle] = useState('');
  const [roomType, setRoomType] = useState('');
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const uniqueTitles = Array.from(new Set(projects.map(p => p.title)));
  const uniqueRoomTypes = Array.from(new Set(projects.map(p => p.room_type)));

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin');
      }
    });

    const unsubscribeProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
      setFirebaseError(null);
    }, (error) => {
      console.error('Projects list error:', error);
      setFirebaseError('Missing permissions to read projects. Please update your Firebase Security Rules.');
    });

    const unsubscribeTeam = onSnapshot(collection(db, 'team'), (snapshot) => {
      const teamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(teamData);
      setFirebaseError(null);
    }, (error) => {
      console.error('Team list error:', error);
      setFirebaseError('Missing permissions to read team members. Please update your Firebase Security Rules.');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
      unsubscribeTeam();
    };
  }, [navigate]);

  const [isSeeding, setIsSeeding] = useState(false);
  const [notification, setNotification] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSeedData = async () => {
    setIsSeeding(true);
    setNotification(null);
    
    const mockProjects = [
      {
        title: 'Minimalist Haven',
        room_type: 'Living Room',
        images: [
          'https://picsum.photos/seed/interior1/1200/1600',
          'https://picsum.photos/seed/interior1b/1200/1600'
        ],
        description: 'A serene living space focusing on natural light, neutral tones, and organic textures. The design emphasizes open-plan living while maintaining cozy nooks for relaxation.',
        testimonial: '"The transformation of our living room is breathtaking. It feels like a sanctuary every time we walk in." — Sarah J.',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      },
      {
        title: 'Industrial Loft',
        room_type: 'Kitchen',
        images: [
          'https://picsum.photos/seed/interior2/1200/1600',
          'https://picsum.photos/seed/interior2b/1200/1600'
        ],
        description: 'Exposed brick meets modern cabinetry in this high-contrast kitchen design. We used reclaimed wood and matte black fixtures to create a sophisticated urban aesthetic.',
        testimonial: '"Our kitchen is now the heart of our home. The industrial style is exactly what we wanted." — Mark T.',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      },
      {
        title: 'Ocean Breeze Suite',
        room_type: 'Bedroom',
        images: [
          'https://picsum.photos/seed/interior3/1200/1600'
        ],
        description: 'A master bedroom designed for ultimate rest. Soft blues and sandy beiges create a coastal atmosphere that is both elegant and incredibly comfortable.',
        testimonial: '"I finally have the bedroom of my dreams. It feels like staying in a 5-star resort every night." — Elena R.',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      },
      {
        title: 'Executive Study',
        room_type: 'Office',
        images: [
          'https://picsum.photos/seed/interior4/1200/1600'
        ],
        description: 'A productive workspace featuring custom walnut shelving and ergonomic design. The lighting is optimized for both video calls and deep focus work.',
        testimonial: '"My productivity has soared since moving into this new office. The design is both beautiful and functional." — David W.',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      },
      {
        title: 'Modern Hallway',
        room_type: 'Hall',
        images: [
          'https://picsum.photos/seed/interior5/1200/1600'
        ],
        description: 'A grand entrance that sets the tone for the entire home. Large-scale art and architectural lighting create a dramatic first impression.',
        testimonial: '"The hallway is now a gallery of its own. Everyone who visits is immediately impressed." — James L.',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      },
      {
        title: 'Cinematic Penthouse',
        room_type: 'Living Room',
        images: [
          'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        ],
        description: 'A cinematic walkthrough of our most ambitious penthouse project. This video highlights the seamless integration of smart home technology with high-end luxury materials.',
        testimonial: '"The video walkthrough perfectly captures the feeling of living in this space. It is truly a masterpiece." — Robert P.',
        mediaType: 'video',
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      },
      {
        title: 'Urban Sanctuary',
        room_type: 'Living Room',
        images: [
          'https://picsum.photos/seed/interior6/1200/1600'
        ],
        description: 'A compact city apartment transformed into a spacious-feeling home through clever use of mirrors, multi-functional furniture, and a light color palette.',
        testimonial: '"I never thought my small apartment could feel this big. The design is pure magic." — Chloe M.',
        mediaType: 'image',
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      }
    ];

    try {
      for (const project of mockProjects) {
        await addDoc(collection(db, 'projects'), project);
      }
      setNotification({ text: 'Mock data seeded successfully!', type: 'success' });
      setActiveTab('library');
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error seeding data:', error);
      setNotification({ text: 'Failed to seed data. Check console for details.', type: 'error' });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as File[];
      setFiles(selectedFiles);
      
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
      
      // Check if the first file is a video
      setIsVideo(selectedFiles[0].type.startsWith('video/'));
    }
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);

    try {
      if (isVideo) {
        // For prototype: Mock AI generation for videos
        setTimeout(() => {
          setSummary('A stunning video walkthrough of our latest interior design project, showcasing dynamic lighting and fluid spatial transitions.');
          setTestimonial('"Seeing the space come alive in this video walkthrough was incredible. The team captured every detail perfectly." — Client');
          setIsGenerating(false);
        }, 1500);
        return;
      }

      // Convert first image to base64
      const firstFile = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(firstFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64String = base64data.split(',')[1];
        
        // Initialize Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const imagePart = {
          inlineData: {
            mimeType: firstFile.type,
            data: base64String,
          },
        };

        const prompt = `
          Analyze this interior design photo. 
          1. Generate a professional Project Summary focusing on materials, lighting, and style (max 3 sentences).
          2. Draft a realistic Client Testimonial praising the design (max 2 sentences).
          
          Format the output exactly as:
          SUMMARY: [summary text]
          TESTIMONIAL: [testimonial text]
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [imagePart, { text: prompt }] },
        });

        const text = response.text || '';
        const summaryMatch = text.match(/SUMMARY:\s*(.*)/);
        const testimonialMatch = text.match(/TESTIMONIAL:\s*(.*)/);

        if (summaryMatch) setSummary(summaryMatch[1].trim());
        if (testimonialMatch) setTestimonial(testimonialMatch[1].trim());
        
        setIsGenerating(false);
      };
    } catch (error) {
      console.error('Error generating content:', error);
      setIsGenerating(false);
      setNotification({ text: 'Failed to generate content. Check console for details.', type: 'error' });
    }
  };

  const handlePublish = async () => {
    if (files.length === 0) {
      setNotification({ text: 'Please upload at least one image or video.', type: 'error' });
      return;
    }
    if (!title || !roomType) {
      setNotification({ text: 'Please fill in Title and Name.', type: 'error' });
      return;
    }
    setIsPublishing(true);

    try {
      const downloadUrls = [];
      
      for (const file of files) {
        try {
          const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);
          downloadUrls.push(downloadUrl);
        } catch (uploadError: any) {
          console.error('Storage Upload Error:', uploadError);
          if (uploadError.code === 'storage/unauthorized') {
            throw new Error('Storage unauthorized: Please enable Firebase Storage in your Firebase Console and update the Security Rules.');
          } else if (uploadError.code === 'storage/object-not-found') {
            throw new Error('Storage bucket not found: Please click "Get Started" under Storage in your Firebase Console.');
          } else {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
        }
      }

      try {
        await addDoc(collection(db, 'projects'), {
          title,
          room_type: roomType,
          images: downloadUrls,
          description: summary,
          testimonial,
          mediaType: isVideo ? 'video' : 'image',
          createdAt: serverTimestamp(),
          authorUid: auth.currentUser?.uid
        });
      } catch (dbError) {
        handleFirestoreError(dbError, OperationType.CREATE, 'projects');
      }

      // Reset form
      setFiles([]);
      setPreviewUrls([]);
      setTitle('');
      setRoomType('');
      setSummary('');
      setTestimonial('');
      setActiveTab('library');
      setNotification({ text: 'Project published successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error publishing project:', error);
      setNotification({ text: `Failed to publish project: ${error.message || 'Unknown error'}. Check console for details.`, type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteDoc(doc(db, 'projects', projectToDelete));
      setProjectToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectToDelete}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingProject) return;
    try {
      await updateDoc(doc(db, 'projects', editingProject.id), {
        title: editingProject.title,
        room_type: editingProject.room_type,
        description: editingProject.description,
        testimonial: editingProject.testimonial
      });
      setEditingProject(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${editingProject.id}`);
    }
  };

  const handleTeamPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTeamPhoto(file);
      setTeamPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePublishTeam = async () => {
    if (!teamName || !teamRole || !teamPhoto) {
      setNotification({ text: 'Please fill all fields and select a photo.', type: 'error' });
      return;
    }

    setIsPublishingTeam(true);
    try {
      const storageRef = ref(storage, `team/${Date.now()}_${teamPhoto.name}`);
      await uploadBytes(storageRef, teamPhoto);
      const downloadUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'team'), {
        name: teamName,
        role: teamRole,
        image: downloadUrl,
        createdAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid
      });

      setTeamName('');
      setTeamRole('');
      setTeamPhoto(null);
      setTeamPhotoPreview(null);
      setNotification({ text: 'Team member added successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error publishing team member:', error);
      setNotification({ text: `Failed to publish team member: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsPublishingTeam(false);
    }
  };

  const handleDeleteTeamMember = async () => {
    if (!memberToDelete) return;
    try {
      await deleteDoc(doc(db, 'team', memberToDelete));
      setMemberToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `team/${memberToDelete}`);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {firebaseError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-6" role="alert">
          <p className="font-bold">Database Permission Error</p>
          <p>{firebaseError}</p>
        </div>
      )}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 p-4 shadow-lg border-l-4 ${notification.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`} role="alert">
          <p>{notification.text}</p>
          <button onClick={() => setNotification(null)} className="absolute top-1 right-1 text-xs opacity-50 hover:opacity-100">×</button>
        </div>
      )}
      <datalist id="project-titles">
        {uniqueTitles.map((t, idx) => <option key={idx} value={t} />)}
      </datalist>
      <datalist id="room-types">
        {uniqueRoomTypes.map((rt, idx) => <option key={idx} value={rt} />)}
      </datalist>

      <nav className="bg-dark text-cream py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src="/logo.svg" alt="AJ Studio" className="h-8 w-auto object-contain bg-cream p-1 rounded" />
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleSeedData} 
            disabled={isSeeding}
            className="text-xs uppercase tracking-widest border border-cream/30 px-3 py-1 hover:bg-cream hover:text-dark transition-all disabled:opacity-50"
          >
            {isSeeding ? 'Seeding...' : 'Seed Mock Data'}
          </button>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-sm hover:text-earth transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Tabs */}
        <div className="flex border-b border-taupe/30 mb-12">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`pb-4 px-6 uppercase tracking-widest text-sm transition-colors ${activeTab === 'upload' ? 'border-b-2 border-dark text-dark' : 'text-dark-muted hover:text-dark'}`}
          >
            Upload New
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`pb-4 px-6 uppercase tracking-widest text-sm transition-colors ${activeTab === 'library' ? 'border-b-2 border-dark text-dark' : 'text-dark-muted hover:text-dark'}`}
          >
            Media Library
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`pb-4 px-6 uppercase tracking-widest text-sm transition-colors ${activeTab === 'team' ? 'border-b-2 border-dark text-dark' : 'text-dark-muted hover:text-dark'}`}
          >
            Meet the Team
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Media Upload */}
            <div className="space-y-6">
              <div className="border-2 border-dashed border-taupe p-8 text-center relative hover:bg-taupe/10 transition-colors cursor-pointer min-h-[300px] flex flex-col items-center justify-center">
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {previewUrls.length > 0 ? (
                  isVideo ? (
                    <video src={previewUrls[0]} controls className="mx-auto max-h-64 object-contain" />
                  ) : (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {previewUrls.map((url, idx) => (
                        <MediaRenderer key={idx} src={url} alt={`Preview ${idx}`} className="w-full h-32 object-cover" />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center space-y-4 text-dark-muted">
                    <Upload className="w-8 h-8" />
                    <span className="font-light">Drop high-res images or video here</span>
                    <span className="text-xs uppercase tracking-widest">Supports JPG, PNG, MP4 (Multiple allowed)</span>
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center space-x-2 bg-dark text-cream py-4 uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isGenerating ? 'Analyzing Media...' : 'Auto-Generate Content'}</span>
                </button>
              )}
            </div>

            {/* Content Editor */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Project Title</label>
                  <input 
                    type="text"
                    list="project-titles"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-white font-light"
                    placeholder="e.g. Armoor Residence"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Name</label>
                  <input 
                    type="text"
                    list="room-types"
                    value={roomType}
                    onChange={e => setRoomType(e.target.value)}
                    className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-white font-light"
                    placeholder="e.g. Living Room"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Project Summary (Optional)</label>
                <textarea 
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={4}
                  className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-white font-light resize-none"
                  placeholder="AI will generate this based on the image..."
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Client Testimonial (Optional)</label>
                <textarea 
                  value={testimonial}
                  onChange={e => setTestimonial(e.target.value)}
                  rows={3}
                  className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-white font-light resize-none"
                  placeholder="AI will draft a testimonial..."
                />
              </div>
              
              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full bg-earth text-cream py-4 uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish Project'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="bg-white border border-taupe/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream border-b border-taupe/30 text-xs tracking-widest uppercase text-dark-muted">
                    <th className="p-4 font-normal">Media</th>
                    <th className="p-4 font-normal">Details</th>
                    <th className="p-4 font-normal">Testimonial</th>
                    <th className="p-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-taupe/10 hover:bg-cream/50 transition-colors">
                      <td className="p-4 w-32 align-top">
                        <div className="aspect-[4/3] bg-taupe/20 relative overflow-hidden rounded-xl">
                          <MediaRenderer src={project.images?.[0] || ''} alt={project.title} className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute top-1 right-1 bg-dark/70 p-1 rounded">
                            {project.mediaType === 'video' ? <Video className="w-3 h-3 text-cream" /> : <ImageIcon className="w-3 h-3 text-cream" />}
                          </div>
                        </div>
                      </td>
                      
                      {editingProject?.id === project.id ? (
                        <>
                          <td className="p-4 align-top">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-dark-muted mb-1">Title</label>
                                <input 
                                  type="text" 
                                  value={editingProject.title} 
                                  onChange={e => setEditingProject({...editingProject, title: e.target.value})} 
                                  className="w-full p-2 border border-taupe/50 focus:border-dark outline-none bg-white font-serif text-lg" 
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-dark-muted mb-1">Name</label>
                                <input 
                                  type="text" 
                                  value={editingProject.room_type} 
                                  onChange={e => setEditingProject({...editingProject, room_type: e.target.value})} 
                                  className="w-full p-2 border border-taupe/50 focus:border-dark outline-none bg-white text-xs tracking-widest uppercase text-earth" 
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-dark-muted mb-1">Description</label>
                                <textarea 
                                  value={editingProject.description} 
                                  onChange={e => setEditingProject({...editingProject, description: e.target.value})} 
                                  rows={3} 
                                  className="w-full p-2 border border-taupe/50 focus:border-dark outline-none bg-white text-sm font-light resize-none" 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-dark-muted mb-1">Testimonial</label>
                              <textarea 
                                value={editingProject.testimonial} 
                                onChange={e => setEditingProject({...editingProject, testimonial: e.target.value})} 
                                rows={6} 
                                className="w-full p-2 border border-taupe/50 focus:border-dark outline-none bg-white text-sm font-light italic resize-none" 
                              />
                            </div>
                          </td>
                          <td className="p-4 text-right align-top">
                            <div className="flex flex-col items-end space-y-2">
                              <button 
                                onClick={handleUpdate} 
                                className="bg-dark text-cream px-4 py-2 uppercase tracking-widest text-xs hover:bg-earth transition-colors w-full"
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => setEditingProject(null)} 
                                className="border border-dark text-dark px-4 py-2 uppercase tracking-widest text-xs hover:bg-dark hover:text-cream transition-colors w-full"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 align-top">
                            <h4 className="font-serif text-lg mb-1">{project.title}</h4>
                            <span className="text-xs tracking-widest uppercase text-earth block mb-2">{project.room_type}</span>
                            <p className="text-sm text-dark-muted font-light line-clamp-2">{project.description}</p>
                          </td>
                          <td className="p-4 align-top">
                            <p className="text-sm text-dark-muted font-light italic line-clamp-3">
                              {project.testimonial}
                            </p>
                          </td>
                          <td className="p-4 text-right align-top">
                            <div className="flex justify-end space-x-3">
                              <button 
                                onClick={() => setEditingProject(project)}
                                className="text-dark-muted hover:text-dark transition-colors"
                                title="Edit Project"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setProjectToDelete(project.id)}
                                className="text-dark-muted hover:text-red-800 transition-colors"
                                title="Delete Project"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'team' && (
          <div className="space-y-12">
            {/* Add New Team Member */}
            <div className="bg-white p-8 border border-taupe/20">
              <h2 className="text-2xl font-serif mb-6">Add Team Member</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm uppercase tracking-widest mb-2">Name</label>
                    <input 
                      type="text" 
                      value={teamName} 
                      onChange={(e) => setTeamName(e.target.value)} 
                      className="w-full p-3 border border-taupe/30 focus:border-dark outline-none bg-transparent" 
                      placeholder="e.g. Anjali Joshi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm uppercase tracking-widest mb-2">Role</label>
                    <input 
                      type="text" 
                      value={teamRole} 
                      onChange={(e) => setTeamRole(e.target.value)} 
                      className="w-full p-3 border border-taupe/30 focus:border-dark outline-none bg-transparent" 
                      placeholder="e.g. Founder & Principal Designer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-widest mb-2">Photo</label>
                  <label className="border-2 border-dashed border-taupe/30 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-dark transition-colors h-[200px] relative overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleTeamPhotoChange} 
                      className="hidden" 
                    />
                    {teamPhotoPreview ? (
                      <MediaRenderer src={teamPhotoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-taupe mb-4" />
                        <span className="text-sm text-dark-muted">Click to upload photo</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handlePublishTeam} 
                  disabled={isPublishingTeam}
                  className="bg-dark text-cream px-8 py-3 uppercase tracking-widest text-sm hover:bg-earth transition-colors disabled:opacity-50"
                >
                  {isPublishingTeam ? 'Publishing...' : 'Add Member'}
                </button>
              </div>
            </div>

            {/* Team Members List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map(member => (
                <div key={member.id} className="bg-white border border-taupe/20 overflow-hidden group">
                  <div className="aspect-[3/4] relative">
                    <MediaRenderer src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setMemberToDelete(member.id)}
                        className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-serif text-xl mb-1">{member.name}</h3>
                    <p className="text-sm text-dark-muted">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Member Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50 p-4">
          <div className="bg-cream p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif mb-4">Delete Team Member?</h3>
            <p className="text-dark-muted mb-8">This action cannot be undone. The member will be permanently removed from the website.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setMemberToDelete(null)} 
                className="px-6 py-2 uppercase tracking-widest text-sm hover:text-earth transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTeamMember} 
                className="bg-red-600 text-white px-6 py-2 uppercase tracking-widest text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-dark/50 z-50 flex items-center justify-center p-4">
          <div className="bg-cream p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif mb-4">Delete Project?</h3>
            <p className="text-dark-muted font-light mb-8">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setProjectToDelete(null)} 
                className="px-6 py-2 uppercase tracking-widest text-sm hover:text-earth transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="bg-red-800 text-cream px-6 py-2 uppercase tracking-widest text-sm hover:bg-red-900 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
