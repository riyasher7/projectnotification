import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

type Campaign = {
  campaign_id: string;
  campaign_name: string;
  notification_type?: string;
  city_filter: string | null;
  content: string;
  created_by: string;
  status: 'DRAFT' | 'SENT';
  created_at: string;
};

export function CampaignSendPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user?.user_id) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let heartbeatInterval: any = null;
    let mounted = true;

    const wsBase =
      import.meta.env.VITE_WS_BASE_URL ||
      (import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')
        : 'ws://localhost:9100');

    const wsUrl = `${wsBase.replace(/\/$/, '')}/ws/notifications/${user.user_id}`;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WS connected', wsUrl);
        heartbeatInterval = setInterval(() => {
          if (ws && ws.readyState === 1) {
            try {
              ws.send(JSON.stringify({ type: 'PING' }));
            } catch {
              /* ignore */
            }
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CAMPAIGN') {
            alert(`📢 ${data.title}\n\n${data.content || ''}`);
          }
        } catch (err) {
          console.error('WS message parse error', err);
        }
      };

      ws.onclose = () => {
        console.log('WS closed, reconnecting in 2s...');
        if (mounted) reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error('WS error', err);
        try {
          ws?.close();
        } catch {
          /* ignore */
        }
      };
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    };
  }, [user?.user_id]);

  useEffect(() => {
    if (!campaignId) return;
    fetchCampaignAndCount();
  }, [campaignId]);

  const fetchCampaignAndCount = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch campaign details
      const campaignRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/campaigns`,
        { headers }
      );

      if (!campaignRes.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const campaigns: Campaign[] = await campaignRes.json();
      const foundCampaign = campaigns.find(c => c.campaign_id === campaignId);

      if (!foundCampaign) {
        throw new Error('Campaign not found');
      }

      setCampaign(foundCampaign);

      // Fetch recipient count
      const recipientsRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/campaigns/${campaignId}/recipients`,
        { headers }
      );

      if (!recipientsRes.ok) {
        throw new Error('Failed to fetch recipients');
      }

      const recipientsData = await recipientsRes.json();
      setUserCount(recipientsData.recipients?.length || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignId) return;

    setSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/campaigns/${campaignId}/send`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send campaign');
      }

      const data = await response.json();

      setSentCount(data.sent_to || 0);
      setSuccessCount(data.success_count || 0);
      setFailedCount(data.failed_count || 0);
      setShowSuccess(true);
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
            <p className="mt-4 text-gray-600">Loading campaign details...</p>
          </div>
        ) : !campaign ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
              Campaign not found
            </div>
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
                  Are you sure you want to send this campaign? This action
                  cannot be undone.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Campaign Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {campaign.campaign_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Eligible Recipients</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {userCount} Users
                  </p>
                </div>
                {campaign.city_filter && (
                  <div>
                    <p className="text-sm text-gray-600">City Filter</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {campaign.city_filter}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Message Content</p>
                  <p className="text-gray-800 mt-2">{campaign.content}</p>
                </div>
              </div>

              {userCount === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                  No eligible recipients found. Check campaign filters or
                  user preferences.
                </div>
              )}

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
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                  <span>{sending ? 'Sending...' : 'Send Campaign'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-green-600" size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Campaign Sent Successfully!
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-gray-600">
                Total Recipients:{' '}
                <span className="font-semibold text-gray-800">{sentCount}</span>
              </p>
              <p className="text-gray-600">
                Successfully Sent:{' '}
                <span className="font-semibold text-green-600">
                  {successCount}
                </span>
              </p>
              {failedCount > 0 && (
                <p className="text-gray-600">
                  Failed:{' '}
                  <span className="font-semibold text-red-600">
                    {failedCount}
                  </span>
                </p>
              )}
            </div>

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