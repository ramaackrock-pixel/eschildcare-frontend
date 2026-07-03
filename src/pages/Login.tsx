import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      // Role-based navigation is handled in the context or here
      if (userData.role === 'staff') {
        navigate('/patients'); // Example staff redirect
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-48 h-20 bg-white/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/20 overflow-hidden p-2 mx-auto">
            <img 
              src="/logo.png" 
              alt="H2F Logo"
              className="w-full h-full object-contain"
            />
          </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Welcome back</h2>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow sm:text-sm bg-slate-50 focus:bg-white"
                  placeholder="admin@physio.inc"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow sm:text-sm bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>



            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => toast.error('Please contact administration to reset your password.')}
                  className="font-semibold text-primary hover:text-primary/80 bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => toast.error('Please contact administration to create an account.')}
                className="font-semibold text-primary hover:text-primary/80 bg-transparent border-none p-0 cursor-pointer"
              >
                Contact administration
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
