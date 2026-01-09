import { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { supabase, UserPreference } from '../lib/supabase';
import type { Page } from '../App';

type Props = {
  onNavigate: (page: Page, data?: any) => void;
};

export function UserPreferenceLoginPage({ onNavigate }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !user || user.password_hash !== password) {
        setMessage('Invalid email or password');
        return;
      }

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const resolvedPrefs: UserPreference =
        prefs ??
        {
          id: '',
          user_id: user.id,
          promotional_offers: true,
          order_updates: true,
          newsletters: true,
          email_channel: true,
          sms_channel: false,
          push_channel: false,
          updated_at: new Date().toISOString(),
        };

      onNavigate('user-preferences', {
        userId: user.id,
        preferences: resolvedPrefs,
      });
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="max-w-md mx-auto py-10">
        <button
          onClick={() => onNavigate('home')}
          className="mb-6 flex items-center text-pink-600"
        >
          <ArrowLeft size={18} />
          <span className="ml-2">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Manage Preferences
          </h2>

          <form onSubmit={handleLookup} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />

            {message && (
              <div className="text-sm text-red-600">{message}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg"
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="w-full border border-pink-500 text-pink-600 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
