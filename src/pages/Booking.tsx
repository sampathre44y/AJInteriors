import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Minus, Plus } from 'lucide-react';

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bedrooms: 0,
    kitchens: 0,
    livingRooms: 0,
    bathrooms: 0,
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => setStep(s => Math.min(s + 1, 2));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const updateRoomCount = (room: keyof typeof formData, increment: number) => {
    setFormData(prev => ({
      ...prev,
      [room]: Math.max(0, (prev[room] as number) + increment)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const message = `*New Estimate Request*

*Project Scope:*
- Bedrooms: ${formData.bedrooms}
- Kitchens: ${formData.kitchens}
- Living Rooms: ${formData.livingRooms}
- Bathrooms: ${formData.bathrooms}

*Client Details:*
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '919494338332'; // Admin's number with country code
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const totalRooms = formData.bedrooms + formData.kitchens + formData.livingRooms + formData.bathrooms;

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-4xl mb-6">Thank You</h2>
          <p className="text-dark-muted font-light text-lg">
            Your estimate request has been received. We will review your project scope and reach out to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 md:px-12 max-w-3xl mx-auto">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl mb-4">Get an Estimate</h1>
        <p className="text-dark-muted font-light">Tell us about your space to get started.</p>
      </div>

      <div className="mb-8 flex justify-center space-x-4">
        {[1, 2].map(i => (
          <div key={i} className={`h-1 w-16 transition-colors ${step >= i ? 'bg-dark' : 'bg-taupe/30'}`} />
        ))}
      </div>

      <div className="bg-white p-8 md:p-12 shadow-sm border border-taupe/20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl mb-6">1. Project Scope</h3>
              <p className="text-dark-muted font-light mb-8">Select the number of rooms you'd like us to design.</p>
              
              <div className="space-y-6">
                {[
                  { id: 'bedrooms', label: 'Bedrooms' },
                  { id: 'kitchens', label: 'Kitchens' },
                  { id: 'livingRooms', label: 'Living Rooms' },
                  { id: 'bathrooms', label: 'Bathrooms' },
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center justify-between p-4 border border-taupe/30">
                    <span className="font-serif text-lg">{label}</span>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => updateRoomCount(id as keyof typeof formData, -1)}
                        className="p-2 text-dark-muted hover:text-dark hover:bg-cream transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-light">{formData[id as keyof typeof formData]}</span>
                      <button 
                        onClick={() => updateRoomCount(id as keyof typeof formData, 1)}
                        className="p-2 text-dark-muted hover:text-dark hover:bg-cream transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={totalRooms === 0}
                  className="bg-dark text-cream px-8 py-3 uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl mb-6">2. Your Details</h3>
              <p className="text-dark-muted font-light mb-8">Where should we send your estimate?</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light"
                  />
                </div>
                <div>
                  <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light"
                  />
                </div>
                <div>
                  <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Phone</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light"
                  />
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <button type="button" onClick={handlePrev} className="text-dark-muted hover:text-dark uppercase tracking-widest text-sm">Back</button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-dark text-cream px-8 py-3 uppercase tracking-widest text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Estimate'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
