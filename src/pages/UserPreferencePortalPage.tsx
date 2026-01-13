import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Save,
  Mail,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

type UserPreference = {
  user_id: string;
  city: string | null;
  offers: boolean;
  order_updates: boolean;
  newsletter: boolean;
  email_channel: boolean;
  sms_channel: boolean;
  push_channel: boolean;
};

type Campaign = {
  campaign_id: string;
  campaign_name: string;
  content: string;
  city_filter: string | null;
  status: 'DRAFT' | 'SENT';
};

type Newsletter = {
  newsletter_id: string;
  news_name: string;
  content: string;
  city_filter: string | null;
  status: 'DRAFT' | 'SENT';
};

type PreferenceToggleKey = keyof UserPreference;

export function UserPreferenceSettingsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const prefRes = await fetch(
        `http://localhost:9100/users/${userId}/preferences`
      );
      console.log(userId)
      if (!prefRes.ok) throw new Error();

      const prefData: UserPreference = await prefRes.json();
      setPreferences(prefData);

      const campRes = await fetch(`http://localhost:9100/campaigns`);
      const campData: Campaign[] = campRes.ok ? await campRes.json() : [];
      console.log(campData)
      console.log(prefData)
      const newsRes = await fetch(`http://localhost:9100/newsletters`);
      const newsData: Newsletter[] = newsRes.ok ? await newsRes.json() : [];

      if (prefData.offers) {
        setCampaigns(
          campData.filter(c =>
            c.status === 'SENT' &&
            (!c.city_filter ||
              c.city_filter.toLowerCase() === prefData.city?.toLowerCase())
          )
        );
      }

      if (prefData.newsletter) {
        setNewsletters(
          newsData.filter(n =>
            n.status === 'SENT' &&
            (!n.city_filter ||
              n.city_filter.toLowerCase() === prefData.city?.toLowerCase())
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: PreferenceToggleKey) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: !preferences[key] });
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferences),
        }
      );
      if (!res.ok) throw new Error();
      setMessage('Preferences saved successfully');
    } catch {
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const ChannelBadge = ({
    active,
    icon: Icon,
    label,
  }: {
    active: boolean;
    icon: any;
    label: string;
  }) => (
    <div
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
        active ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-400'
      }`}
    >
      <Icon size={14} />
      {label}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!preferences) {
    return <div className="text-center">Preferences not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="max-w-5xl mx-auto py-8 space-y-10">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-pink-600"
        >
          <ArrowLeft size={18} />
          <span className="ml-2">Back</span>
        </button>

        {/* ================= CAMPAIGNS ================= */}
        {preferences.offers && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Campaigns Available for You
              </h2>

              <div className="flex gap-2">
                <ChannelBadge active={preferences.email_channel} icon={Mail} label="Email" />
                <ChannelBadge active={preferences.sms_channel} icon={MessageSquare} label="SMS" />
                <ChannelBadge active={preferences.push_channel} icon={Bell} label="Push" />
              </div>
            </div>

            {campaigns.length === 0 ? (
              <p className="text-gray-600">
                No campaigns available for your city.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {campaigns.map(c => (
                  <div
                    key={c.campaign_id}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-xl font-semibold text-pink-600 mb-2">
                      {c.campaign_name}
                    </h3>
                    <p className="text-gray-600">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= NEWSLETTERS ================= */}
        {preferences.newsletter && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Newsletters Available for You
              </h2>

              <div className="flex gap-2">
                <ChannelBadge active={preferences.email_channel} icon={Mail} label="Email" />
                <ChannelBadge active={preferences.sms_channel} icon={MessageSquare} label="SMS" />
                <ChannelBadge active={preferences.push_channel} icon={Bell} label="Push" />
              </div>
            </div>

            {newsletters.length === 0 ? (
              <p className="text-gray-600">
                No newsletters available for your city.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {newsletters.map(n => (
                  <div
                    key={n.newsletter_id}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-xl font-semibold text-pink-600 mb-2">
                      {n.news_name}
                    </h3>
                    <p className="text-gray-600">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= PREFERENCES (UNCHANGED) ================= */}
        <section className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-xl font-bold">Notification Preferences</h2>

          <div className="space-y-3">
            {[
              ['Receive Offers', 'offers'],
              ['Receive Order Updates', 'order_updates'],
              ['Receive Newsletter', 'newsletter'],
            ].map(([label, key]) => (
              <div key={key} className="flex justify-between items-center">
                <span>{label}</span>
                <button
                  onClick={() => toggle(key as PreferenceToggleKey)}
                  className={`h-6 w-11 rounded-full ${
                    preferences[key as PreferenceToggleKey]
                      ? 'bg-pink-600'
                      : 'bg-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>

          {message && (
            <div
              className={`text-sm text-center p-3 rounded-lg ${
                message.includes('success')
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-pink-600 text-white py-3 rounded-lg
                       flex justify-center items-center gap-2
                       hover:bg-pink-700 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </section>
      </div>
    </div>
  );
}


