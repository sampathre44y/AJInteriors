import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-dark text-cream py-4 uppercase tracking-widest text-sm disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}
