import { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        'http://127.0.0.1:9100/auth/user/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Invalid email or password' }));
        throw new Error(errorData.detail || 'Invalid email or password');
      }

      const data = await response.json();
      // Backend now returns: { user_id, email, name, role_id, session_token }

      // Extract user data (without session_token)
      const user = {
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        role_id: data.role_id
      };

      // Store user and session_token in AuthContext
      login(user, data.session_token);

      // Role-based redirect
      if (data.role_id === 1) {
        navigate('/dashboard');
      } else if (data.role_id === 2 || data.role_id === 3) {
        navigate('/notifications');
      } else {
        navigate(`/user/${data.user_id}/preferences`);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center space-x-2 text-[#FF1774] hover:text-[#FF1774] transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/nykaa-logo.png" alt="Nykaa logo" className="w-40 h-auto mb-4 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF1774] to-[#FF1774] text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <LogIn size={20} />
              <span>{loading ? 'Logging in...' : 'Login'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-[#FF1774] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


