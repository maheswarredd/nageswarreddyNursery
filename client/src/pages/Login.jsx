import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const user = await login(email, password);

       if (user?.role === 'admin') {
       navigate('/admin', { replace: true });
       } else {
       navigate(redirectPath || '/', { replace: true });
       }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-forest-100 shadow-xl space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-forest-950">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to track plant orders, address book, and notifications.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 text-center text-xs text-gray-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-forest-700 hover:underline">
            Create an Account
          </Link>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3 bg-forest-50/70 border border-forest-200/80 rounded-xl text-[11px] text-forest-900 space-y-1">
          <p className="font-bold">🔑 Administrator Credentials (from env):</p>
          <p>Email: <code>admin@nageswarreddyplants.com</code></p>
          <p>Password: <code>Admin@Nageswar123!</code></p>
        </div>

      </div>
    </div>
  );
};

export default Login;
