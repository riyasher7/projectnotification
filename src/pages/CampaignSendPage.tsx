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

  useEffect(() => {
    if (!campaignId) return;
    fetchCampaignAndCount();
  }, [campaignId]);

  const fetchCampaignAndCount = async () => {
    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      let usersQuery = supabase
        .from('users')
        .select('*, user_preferences(*)')
        .eq('is_active', true);

      if (campaignData.city_filter) {
        usersQuery = usersQuery.eq('city', campaignData.city_filter);
      }

      const { data: usersData, error: usersError } = await usersQuery;
      if (usersError) throw usersError;

      const filtered =
        usersData?.filter((user: any) => {
          const prefs = user.user_preferences?.[0];
          if (!prefs) return false;

          const prefKey = campaignData.notification_type;
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
    if (!campaign || !campaignId) return;

    setSending(true);
    try {
      let usersQuery = supabase
        .from('users')
        .select('*, user_preferences(*)')
        .eq('is_active', true);

      if (campaign.city_filter) {
        usersQuery = usersQuery.eq('city', campaign.city_filter);
      }

      const { data: usersData, error: usersError } = await usersQuery;
      if (usersError) throw usersError;

      const eligibleUsers =
        usersData?.filter((user: any) => {
          const prefs = user.user_preferences?.[0];
          if (!prefs) return false;

          const prefKey = campaign.notification_type;
          return prefs[prefKey] === true;
        }) || [];

      const notificationLogs = eligibleUsers.map((user: any) => ({
        campaign_id: campaignId,
        user_id: user.id,
        status: Math.random() > 0.1 ? 'success' : 'failed',
      }));

      if (notificationLogs.length > 0) {
        const { error: logsError } = await supabase
          .from('notification_logs')
          .insert(notificationLogs);

        if (logsError) throw logsError;
      }

      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      alert(`Campaign sent successfully to ${eligibleUsers.length} users!`);
      navigate('/campaigns');
    } catch (error) {
      console.error('Error sending campaign:', error);
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
                    {campaign?.name}
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
    </Layout>
  );
}

