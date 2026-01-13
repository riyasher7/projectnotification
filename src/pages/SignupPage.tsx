import { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SignupPage() {
  const navigate = useNavigate();

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
      // 1️⃣ Insert user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([
          {
            name: name,
            email,
            password: password, // ⚠️ hash later in backend
            phone: phoneNumber,
            city,
            gender,
            is_active: true,
            role_id: 4,
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // 2️⃣ Create default preferences
      const { error: prefError } = await supabase
        .from('user_preferences')
        .insert([
          {
            user_id: user.user_id,
            offers: true,
            order_updates: true,
            newsletter: true
          },
        ]);

      const { error: notifError } = await supabase
        .from('notification_type')
        .insert([
          {
            user_id: user.user_id,
            email: true,
            sms: true,
            push: true
          },
        ]);

      if (prefError) throw prefError;
      if (notifError) throw notifError;

      // 3️⃣ Redirect to user preference portal
      navigate(`/user/${user.user_id}/preferences`);
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
          onClick={() => navigate('/employee/login')}
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
