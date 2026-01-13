import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

type PreferenceToggleKey = keyof Pick<
  UserPreference,
  | 'offers'
  | 'order_updates'
  | 'newsletter'
  | 'email_channel'
  | 'sms_channel'
  | 'push_channel'
>;

type UserPreference = {
  id: string;
  user_id: string;
  offers: boolean;
  order_updates: boolean;
  newsletter: boolean;
  email_channel: boolean;
  sms_channel: boolean;
  push_channel: boolean;
};

type ToggleRowProps = {
  label: string;
  field: PreferenceToggleKey;
};

export function UserPreferenceSettingsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:9100/users/${userId}/preferences`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await res.json();
      setPreferences(data);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };



  const toggle = (key: PreferenceToggleKey) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSave = async () => {
    if (!preferences || !userId) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(
        `http://localhost:9100/users/${userId}/preferences`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offers: preferences.offers,
            order_updates: preferences.order_updates,
            newsletter: preferences.newsletter,
            email_channel: preferences.email_channel,
            sms_channel: preferences.sms_channel,
            push_channel: preferences.push_channel,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Save failed');
      }

      setMessage('Preferences saved successfully');
    } catch (err) {
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };


  const ToggleRow = ({ label, field }: ToggleRowProps) => (
    <div className="flex justify-between items-center py-3 border-b">
      <span>{label}</span>
      <button
        onClick={() => toggle(field)}
        className={`h-6 w-11 rounded-full transition-colors ${preferences?.[field] ? 'bg-[#FF1774]' : 'bg-gray-300'
          }`}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF1774]" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Preferences not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center text-pink-600"
        >
          <ArrowLeft size={18} />
          <span className="ml-2">Back to Login</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center mb-6">
            <img src="/nykaa-logo.png" alt="Nykaa logo" className="w-40 h-auto mb-4 mx-auto" />
            <h2 className="text-2xl font-bold">Notification Preferences</h2>
            <p className="text-gray-600 mt-2">Choose how you want to receive notifications</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-700">Notification Type</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Email</th>
                  <th className="text-center p-4 font-semibold text-gray-700">SMS</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Push</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4 font-medium">Offers</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('email_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.offers && preferences?.email_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('sms_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.offers && preferences?.sms_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('push_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.offers && preferences?.push_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Order Updates</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('email_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.order_updates && preferences?.email_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('sms_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.order_updates && preferences?.sms_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('push_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.order_updates && preferences?.push_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Newsletter</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('email_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.newsletter && preferences?.email_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('sms_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.newsletter && preferences?.sms_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggle('push_channel')}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        preferences?.newsletter && preferences?.push_channel ? 'bg-[#FF1774]' : 'bg-gray-300'
                      }`}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-3">Enable/Disable Notification Types</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Receive Offers</span>
                <button
                  onClick={() => toggle('offers')}
                  className={`h-6 w-11 rounded-full transition-colors ${
                    preferences?.offers ? 'bg-[#FF1774]' : 'bg-gray-300'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center">
                <span>Receive Order Updates</span>
                <button
                  onClick={() => toggle('order_updates')}
                  className={`h-6 w-11 rounded-full transition-colors ${
                    preferences?.order_updates ? 'bg-[#FF1774]' : 'bg-gray-300'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center">
                <span>Receive Newsletter</span>
                <button
                  onClick={() => toggle('newsletter')}
                  className={`h-6 w-11 rounded-full transition-colors ${
                    preferences?.newsletter ? 'bg-[#FF1774]' : 'bg-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#FF1774] text-white py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 hover:bg-[#e01569] transition-colors"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
