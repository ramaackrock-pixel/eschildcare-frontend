import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 py-12 font-sans text-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Physio</h1>
          <p className="text-xs font-semibold text-slate-500 tracking-widest mt-2 uppercase">Health Enterprise</p>
        </div>

        <div className="bg-white py-12 px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 flex flex-col items-center">
          <div className="mb-6">
            <span className="text-8xl font-black text-primary opacity-20">404</span>
            <h2 className="text-3xl font-bold text-slate-800 -mt-10 relative">Page Not Found</h2>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Check the URL or return to the dashboard.
          </p>

          <Link
            to="/dashboard"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Dashboard
          </Link>

          <div className="mt-6">
            <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-primary transition-colors">
              Return to Login
            </Link>
          </div>
        </div>

        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Physio Health Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
}
