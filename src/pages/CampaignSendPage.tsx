import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase, Campaign } from '../lib/supabase';

export function CampaignSendPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);


  useEffect(() => {
    if (!campaignId) return;
    fetchCampaignAndCount();
  }, [campaignId]);

  const fetchCampaignAndCount = async () => {
  try {
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (campaignError) throw campaignError;
    setCampaign(campaignData);

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*, user_preferences(*)')
      .eq('is_active', true)
      .eq('role_id', 4);

    if (usersError) throw usersError;

    const cityFilter = campaignData.city_filter?.toLowerCase();

    const filtered =
      usersData?.filter((user: any) => {
        // ✅ city filter (case-insensitive)
        if (cityFilter) {
          const userCity = user.city?.toLowerCase();
          if (userCity !== cityFilter) return false;
        }

        // ✅ preference filter
        const prefs = user.user_preferences;
        if (!prefs) return false;

        const prefKey = 'offers';
        return prefs[prefKey] === true;
      }) || [];

    setUserCount(filtered.length);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};


  const handleSendCampaign = async () => {
    if (!campaignId) return;

    setSending(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/campaigns/${campaignId}/send`,
        { method: 'POST' }
      );

      if (!res.ok) {
        throw new Error('Failed to send campaign');
      }

      const data = await res.json();

      setSentCount(data.sent_to);
      setShowSuccess(true);
      //setUserCount(data.length);
    } catch (err) {
      console.error(err);
      alert('Failed to send campaign');
    } finally {
      setSending(false);
    }
  };



  return (
    <Layout>
      <div className="px-4">
        <button
          onClick={() => navigate('/campaigns')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Campaigns</span>
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-yellow-600" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Confirm Campaign Send
                </h2>
                <p className="text-gray-600">
                  Are you sure you want to send this campaign? This action cannot be undone.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Campaign Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {campaign?.campaign_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Eligible Recipients</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {userCount} Users
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Message Content</p>
                  <p className="text-gray-800 mt-2">{campaign?.content}</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/campaigns')}
                  disabled={sending}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendCampaign}
                  disabled={sending || userCount === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all font-semibold disabled:opacity-50"
                >
                  <Send size={20} />
                  <span>{sending ? 'Sending...' : 'Send Campaign'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-green-600" size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Campaign Sent
            </h2>

            <p className="text-gray-600 mb-6">
              Notification successfully sent to{' '}
              <span className="font-semibold">{sentCount}</span> users.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/logs');
                }}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                View Logs
              </button>

              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/campaigns');
                }}
                className="flex-1 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold text-gray-700"
              >
                Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

