import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase, UserPreference } from '../lib/supabase';
import type { Page } from '../App';

type Props = {
  onNavigate: (page: Page) => void;
  userId: string;
  initialPreferences: UserPreference;
};
type PreferenceToggleKey =
  | 'promotional_offers'
  | 'order_updates'
  | 'newsletters'
  | 'email_channel'
  | 'sms_channel'
  | 'push_channel';

type ToggleRowProps = {
  label: string;
  field: PreferenceToggleKey;
};
export function UserPreferenceSettingsPage({
  onNavigate,
  userId,
  initialPreferences,
}: Props) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggle = (key: PreferenceToggleKey) => {
  setPreferences({
    ...preferences,
    [key]: !preferences[key],
  });
};

  const handleSave = async () => {
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
      className={`h-6 w-11 rounded-full ${
        preferences[field] ? 'bg-pink-600' : 'bg-gray-300'
      }`}
    />
  </div>
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={() => onNavigate('user-preference-login')}
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
            <ToggleRow label="Promotional Offers" field="promotional_offers" />
            <ToggleRow label="Order Updates" field="order_updates" />
            <ToggleRow label="Newsletters" field="newsletters" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Channels</h3>
            <ToggleRow label="Email" field="email_channel" />
            <ToggleRow label="SMS" field="sms_channel" />
            <ToggleRow label="Push" field="push_channel" />
          </div>

          {message && <div className="text-sm text-green-600">{message}</div>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-pink-600 text-white py-3 rounded-lg flex justify-center items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
