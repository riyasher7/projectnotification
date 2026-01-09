import { useEffect, useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase, Campaign, User } from '../lib/supabase';
import type { Page } from '../App';

type CampaignPreviewPageProps = {
  onNavigate: (page: Page, data?: any) => void;
  campaignId: string;
};

export function CampaignPreviewPage({ onNavigate, campaignId }: CampaignPreviewPageProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignAndUsers();
  }, [campaignId]);

  const fetchCampaignAndUsers = async () => {
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

      const filtered = usersData?.filter((user: any) => {
        const prefs = user.user_preferences?.[0];
        if (!prefs) return false;

        const prefKey = campaignData.notification_type;
        return prefs[prefKey] === true;
      }) || [];

      setEligibleUsers(filtered);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
    <Layout currentPage="campaigns" onNavigate={onNavigate}>
      <div className="px-4">
        <button
          onClick={() => onNavigate('campaigns')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Campaigns</span>
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Campaign Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Campaign Name</p>
                  <p className="text-lg font-semibold text-gray-800">{campaign?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Notification Type</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {campaign && getNotificationTypeLabel(campaign.notification_type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City Filter</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {campaign?.city_filter || 'All Cities'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      campaign?.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {campaign?.status.charAt(0).toUpperCase()}
                    {campaign?.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-600">Message Content</p>
                <p className="text-lg text-gray-800 mt-2 bg-gray-50 p-4 rounded-lg">
                  {campaign?.content}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Eligible Recipients</h2>
                <div className="flex items-center space-x-2 bg-pink-100 text-pink-800 px-4 py-2 rounded-lg">
                  <Users size={20} />
                  <span className="font-bold">{eligibleUsers.length} Users</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eligibleUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.city}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {eligibleUsers.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  No eligible users found for this campaign.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
