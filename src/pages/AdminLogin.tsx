import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-cream p-12">
        <h1 className="text-3xl font-serif mb-8 text-center">Studio Access</h1>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-4 mb-6 text-sm font-light">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm uppercase tracking-widest mb-2">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-dark/20 py-2 focus:outline-none focus:border-dark transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-widest mb-2">Access Code</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-dark/20 py-2 focus:outline-none focus:border-dark transition-colors"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-dark text-cream py-4 uppercase tracking-widest text-sm disabled:opacity-50 mt-8"
          >
            {loading ? 'Authenticating...' : 'Enter Studio'}
          </button>
        </form>
      </div>
    </div>
  );
}
