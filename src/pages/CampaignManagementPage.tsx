import { useEffect, useState } from 'react';
import { Plus, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase, Campaign } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function CampaignManagementPage() {
  const navigate = useNavigate();
  const { employee, isViewer } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    notification_type: 'promotional_offers' as
      | 'promotional_offers'
      | 'order_updates'
      | 'newsletters',
    city_filter: '',
    content: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('campaigns').insert([
        {
          ...formData,
          city_filter: formData.city_filter || null,
          created_by: employee?.id,
          status: 'draft',
        },
      ]);

      if (error) throw error;

      setShowModal(false);
      setFormData({
        name: '',
        notification_type: 'promotional_offers',
        city_filter: '',
        content: '',
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      promotional_offers: 'Promotional Offers',
      order_updates: 'Order Updates',
      newsletters: 'Newsletters',
    };
    return labels[type] || type;
  };

  return (
    <Layout>
      <div className="px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Campaign Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage your notification campaigns
            </p>
          </div>

          {!isViewer && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <Plus size={20} />
              <span>New Campaign</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
          </div>
        ) : (
          <div className="grid gap-6">
            {campaigns.map(campaign => (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {campaign.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Type:</span>{' '}
                        {getNotificationTypeLabel(
                          campaign.notification_type
                        )}
                      </p>

                      {campaign.city_filter && (
                        <p>
                          <span className="font-medium">City Filter:</span>{' '}
                          {campaign.city_filter}
                        </p>
                      )}

                      <p>
                        <span className="font-medium">Content:</span>{' '}
                        {campaign.content}
                      </p>

                      <p>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(
                          campaign.created_at
                        ).toLocaleDateString()}
                      </p>

                      {campaign.sent_at && (
                        <p>
                          <span className="font-medium">Sent:</span>{' '}
                          {new Date(
                            campaign.sent_at
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/campaigns/${campaign.id}/preview`)
                      }
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Eye size={18} />
                      <span>Preview</span>
                    </button>

                    {campaign.status === 'draft' && !isViewer && (
                      <button
                        onClick={() =>
                          navigate(`/campaigns/${campaign.id}/send`)
                        }
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Send size={18} />
                        <span>Send</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600">
                  No campaigns yet. Create your first campaign!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Campaign Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Create New Campaign
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <select
                    value={formData.notification_type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        notification_type:
                          e.target.value as typeof formData.notification_type,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    <option value="promotional_offers">
                      Promotional Offers
                    </option>
                    <option value="order_updates">Order Updates</option>
                    <option value="newsletters">Newsletters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City Filter (Optional)
                  </label>
                  <input
                    value={formData.city_filter}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        city_filter: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={e =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        name: '',
                        notification_type: 'promotional_offers',
                        city_filter: '',
                        content: '',
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg"
                  >
                    Save as Draft
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

