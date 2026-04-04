import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { GoogleGenAI } from '@google/genai';
import { Upload, Wand2, LogOut, Image as ImageIcon, Video, Trash2, Edit2 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  
  // Library State
  const [projects, setProjects] = useState<any[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<any | null>(null);

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
    }, (error) => {
      console.error("Error fetching projects:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
    };
  }, [navigate]);

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
      alert('Failed to generate content. Check console for details.');
    }
  };

  const handlePublish = async () => {
    if (files.length === 0 || !title || !roomType || !summary || !testimonial) return;
    setIsPublishing(true);

    try {
      const downloadUrls = [];
      
      for (const file of files) {
        const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        downloadUrls.push(downloadUrl);
      }

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

      // Reset form
      setFiles([]);
      setPreviewUrls([]);
      setTitle('');
      setRoomType('');
      setSummary('');
      setTestimonial('');
      setActiveTab('library');
    } catch (error) {
      console.error('Error publishing project:', error);
      alert('Failed to publish project. Check console for details.');
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
      console.error('Error deleting project:', error);
      alert('Failed to delete project.');
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
      console.error('Error updating project:', error);
      alert('Failed to update project.');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
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
        <button onClick={handleLogout} className="flex items-center space-x-2 text-sm hover:text-earth transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
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
                        <img key={idx} src={url} alt={`Preview ${idx}`} className="w-full h-32 object-cover" />
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
                  <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Room Type</label>
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
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Project Summary</label>
                <textarea 
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={4}
                  className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-white font-light resize-none"
                  placeholder="AI will generate this based on the image..."
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Client Testimonial</label>
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
                disabled={!summary || !testimonial || !title || isPublishing}
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
                      <td className="p-4 w-32">
                        <div className="aspect-[4/3] bg-taupe/20 relative overflow-hidden">
                          <img src={project.images?.[0] || ''} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute top-1 right-1 bg-dark/70 p-1 rounded">
                            {project.mediaType === 'video' ? <Video className="w-3 h-3 text-cream" /> : <ImageIcon className="w-3 h-3 text-cream" />}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <h4 className="font-serif text-lg mb-1">{project.title}</h4>
                        <span className="text-xs tracking-widest uppercase text-earth block mb-2">{project.room_type}</span>
                        <p className="text-sm text-dark-muted font-light line-clamp-2">{project.description}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-dark-muted font-light italic line-clamp-3">
                          {project.testimonial}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => setEditingProject(project)}
                            className="text-dark-muted hover:text-dark transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setProjectToDelete(project.id)}
                            className="text-dark-muted hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-dark/50 z-50 flex items-center justify-center p-4">
          <div className="bg-cream p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-serif mb-6">Edit Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Title</label>
                <input 
                  type="text" 
                  list="project-titles"
                  value={editingProject.title} 
                  onChange={e => setEditingProject({...editingProject, title: e.target.value})} 
                  className="w-full p-3 border border-taupe/30 focus:border-dark outline-none bg-white font-light" 
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Room Type</label>
                <input 
                  type="text" 
                  list="room-types"
                  value={editingProject.room_type} 
                  onChange={e => setEditingProject({...editingProject, room_type: e.target.value})} 
                  className="w-full p-3 border border-taupe/30 focus:border-dark outline-none bg-white font-light" 
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Description</label>
                <textarea 
                  value={editingProject.description} 
                  onChange={e => setEditingProject({...editingProject, description: e.target.value})} 
                  rows={3} 
                  className="w-full p-3 border border-taupe/30 focus:border-dark outline-none bg-white font-light resize-none" 
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-dark-muted mb-2">Testimonial</label>
                <textarea 
                  value={editingProject.testimonial} 
                  onChange={e => setEditingProject({...editingProject, testimonial: e.target.value})} 
                  rows={3} 
                  className="w-full p-3 border border-taupe/30 focus:border-dark outline-none bg-white font-light resize-none" 
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button 
                onClick={() => setEditingProject(null)} 
                className="px-6 py-2 uppercase tracking-widest text-sm hover:text-earth transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate} 
                className="bg-dark text-cream px-6 py-2 uppercase tracking-widest text-sm hover:bg-earth transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
