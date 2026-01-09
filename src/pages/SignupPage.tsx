import { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../App';

type SignupPageProps = {
  onNavigate: (page: Page, data?: any) => void;
};


export function SignupPage({ onNavigate }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [city, setcity] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say'>(
  'prefer_not_to_say'
);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.from('employees').insert([
        {
          name,
          email,
          password_hash: password, // ⚠️ Hash in production
          role: 'viewer',
          is_active: true,
        },
      ]);

      if (error) throw error;

      onNavigate('login');
    } catch (err) {
      setError('Signup failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => onNavigate('login')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700"
        >
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-pink-600 mb-2">Nykaa</h1>
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
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
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
                value={PhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                pattern="[0-9]{10}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setcity(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gender
              </label>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'prefer_not_to_say')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  Male
                </label>

                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'prefer_not_to_say')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  Female
                </label>

                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="gender"
                    value="prefer_not_to_say"
                    checked={gender === 'prefer_not_to_say'}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'prefer_not_to_say')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  Prefer not to say
                </label>
              </div>
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
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <UserPlus size={20} />
              <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
