import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, UserPreference } from '../lib/supabase';

type PreferenceToggleKey =
  | 'offers'
  | 'order_updates'
  | 'newsletter'
  | 'email_channel'
  | 'sms_channel'
  | 'push_channel';

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
    setLoading(true);
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setPreferences(data);
    }
    setLoading(false);
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

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ ...preferences, user_id: userId });

    if (error) {
      setMessage('Failed to save preferences');
    } else {
      setMessage('Preferences saved successfully');
    }

    setSaving(false);
  };

  const ToggleRow = ({ label, field }: ToggleRowProps) => (
    <div className="flex justify-between items-center py-3 border-b">
      <span>{label}</span>
      <button
        onClick={() => toggle(field)}
        className={`h-6 w-11 rounded-full transition-colors ${
          preferences?.[field] ? 'bg-pink-600' : 'bg-gray-300'
        }`}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
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
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={() => navigate('/user/login')}
          className="mb-6 flex items-center text-pink-600"
        >
          <ArrowLeft size={18} />
          <span className="ml-2">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Notification Preferences
          </h2>

          <div>
            <h3 className="font-semibold mb-2">Notification Types</h3>
            <ToggleRow label="Offers" field="offers" />
            <ToggleRow label="Order Updates" field="order_updates" />
            <ToggleRow label="Newsletter" field="newsletter" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Channels</h3>
            <ToggleRow label="Email" field="email_channel" />
            <ToggleRow label="SMS" field="sms_channel" />
            <ToggleRow label="Push" field="push_channel" />
          </div>

          {message && (
            <div className="text-sm text-green-600 text-center">
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-pink-600 text-white py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
