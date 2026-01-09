import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase, User, UserPreference } from '../lib/supabase';

export function UserPreferencesViewPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [userRes, prefsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (userRes.data) setUser(userRes.data);
      if (prefsRes.data) setPreferences(prefsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const PreferenceItem = ({
    label,
    value,
  }: {
    label: string;
    value: boolean;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <span className="text-gray-700 font-medium">{label}</span>
      <div
        className={`flex items-center space-x-2 ${
          value ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {value ? <Check size={20} /> : <X size={20} />}
        <span className="font-semibold">
          {value ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="px-4">
        <button
          onClick={() => navigate('/users')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Users</span>
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
          </div>
        ) : (
          <div className="max-w-3xl">
            {/* User info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                User Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user?.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user?.city}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      user?.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-2">
                <PreferenceItem
                  label="Promotional Offers"
                  value={preferences?.offers || false}
                />
                <PreferenceItem
                  label="Order Updates"
                  value={preferences?.order_updates || false}
                />
                <PreferenceItem
                  label="Newsletters"
                  value={preferences?.newsletter || false}
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">
                Communication Channels
              </h3>

              <div className="space-y-2">
                <PreferenceItem
                  label="Email"
                  value={preferences?.email_channel || false}
                />
                <PreferenceItem
                  label="SMS"
                  value={preferences?.sms_channel || false}
                />
                <PreferenceItem
                  label="Push Notifications"
                  value={preferences?.push_channel || false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

