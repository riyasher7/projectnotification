import { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<
    'male' | 'female' | 'prefer_not_to_say'
  >('prefer_not_to_say');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:9100/auth/user/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            gender,
            city,
            phone: phoneNumber
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Signup failed' }));
        throw new Error(errorData.detail || 'Signup failed');
      }

      const data = await response.json();
      // Backend now returns: { user_id, email, name, session_token }

      // Extract user data
      const user = {
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        role_id: 4 // New signups are always normal users (role_id: 4)
      };

      // Store user and session_token in AuthContext
      login(user, data.session_token);

      // Redirect to user preference portal
      navigate(`/user/${data.user_id}/preferences`);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700"
        >
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/nykaa-logo.png" alt="Nykaa logo" className="w-40 h-auto mb-4 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800">
              User Signup
            </h2>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gender
              </label>

              <div className="flex gap-6">
                {(['male', 'female', 'prefer_not_to_say'] as const).map(g => (
                  <label key={g} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    {g.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
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
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <UserPlus size={20} />
              <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-pink-600 hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}