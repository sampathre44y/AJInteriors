import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    planningInterior: 'immediately',
    location: '',
    propertyType: '1BHK',
    contactNo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const message = `*New Contact Request*

*Details:*
- Name: ${formData.name}
- Planning Interior: ${formData.planningInterior}
- Location: ${formData.location}
- Property Type: ${formData.propertyType}
- Contact No: ${formData.contactNo}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '919494338332'; // Admin's number with country code
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-4xl mb-6">Thank You</h2>
          <p className="text-dark-muted font-light text-lg">
            Your request has been received. We will reach out to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 md:px-12 max-w-3xl mx-auto">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl mb-4">Get in touch</h1>
        <p className="text-dark-muted font-light">Tell us about your project to get started.</p>
      </div>

      <div className="bg-white p-8 md:p-12 shadow-sm border border-taupe/20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Planning Interior</label>
              <select
                required
                value={formData.planningInterior}
                onChange={e => setFormData({ ...formData, planningInterior: e.target.value })}
                className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light appearance-none"
              >
                <option value="immediately">Immediately</option>
                <option value="30 days">30 Days</option>
                <option value="45 days">45 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Location</label>
              <input 
                required
                type="text" 
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light"
                placeholder="Your Location"
              />
            </div>

            <div>
              <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Property Type</label>
              <select
                required
                value={formData.propertyType}
                onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light appearance-none"
              >
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK/Duplex">4 BHK / Duplex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm tracking-widest uppercase text-dark-muted mb-2">Contact No.</label>
              <input 
                required
                type="tel" 
                value={formData.contactNo}
                onChange={e => setFormData({ ...formData, contactNo: e.target.value })}
                className="w-full p-4 border border-taupe/30 focus:border-dark outline-none bg-transparent font-light"
                placeholder="Your Phone Number"
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-dark text-cream px-8 py-3 uppercase tracking-widest text-sm disabled:opacity-50 w-full md:w-auto"
              >
                {isSubmitting ? 'Submitting...' : 'Contact Us'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
