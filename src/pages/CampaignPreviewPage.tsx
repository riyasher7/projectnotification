import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase, Campaign } from '../lib/supabase';

export function CampaignPreviewPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) return;

    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (err) {
      console.error('Failed to fetch campaign', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      offers: 'Promotional Offers',
      order_updates: 'Order Updates',
      newsletter: 'Newsletter',
    };
    return labels[type] || type;
  };

  return (
    <Layout>
      <div className="px-4">
        {/* Back */}
        <button
          onClick={() => navigate('/campaigns')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700"
        >
          <ArrowLeft size={20} />
          <span>Back to Campaigns</span>
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
          </div>
        ) : !campaign ? (
          <div className="text-center text-red-600">
            Campaign not found
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Campaign Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Campaign Details
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Campaign Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {campaign.campaign_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Notification Type</p>
                  <p className="text-lg font-semibold text-gray-800">
                    Promotional Offers
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">City Filter</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {campaign.city_filter || 'All Cities'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      campaign.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-600">Message Content</p>
                <p className="text-lg text-gray-800 mt-2 bg-gray-50 p-4 rounded-lg">
                  {campaign.content}
                </p>
              </div>
            </div>

            {/* View Recipients */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Eligible Recipients
              </h2>

              <button
                onClick={() =>
                  navigate(`/campaigns/${campaign.campaign_id}/recipients`)
                }
                className="bg-[#FF1774] hover:bg-[#FF1774] text-white px-6 py-3 rounded-lg font-medium"
              >
                View Recipients
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

