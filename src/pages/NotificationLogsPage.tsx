import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

type Campaign = {
  campaign_id: string;
  campaign_name: string;
};

type CampaignLog = {
  log_id: string;
  user_id: string;
  notification_type: string;
  status: 'SUCCESS' | 'FAILED';
  sent_at: string;
};

export function NotificationLogsPage() {
  const { getAuthHeaders } = useAuth();
  
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  const [allLogs, setAllLogs] = useState<CampaignLog[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [selectedCampaign, allLogs]);

  /* =======================
     Data Fetching
  ======================= */

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/campaigns`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data: any[] = await response.json();
      
      // Filter only SENT campaigns
      const sentCampaigns = data
        .filter(c => c.status === 'SENT')
        .map(c => ({
          campaign_id: c.campaign_id,
          campaign_name: c.campaign_name,
        }));
      
      setCampaigns(sentCampaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Note: You'll need to create this endpoint in your backend
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/notification-logs`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data: CampaignLog[] = await response.json();
      setAllLogs(data);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setLogs([]);
      setAllLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    if (!selectedCampaign) {
      setLogs(allLogs);
    } else {
      const filtered = allLogs.filter(log => log.log_id === selectedCampaign);
      setLogs(filtered);
    }
  };

  /* =======================
     Helpers
  ======================= */

  const getSuccessRate = () => {
    if (logs.length === 0) return 0;
    const successCount = logs.filter(log => log.status === 'SUCCESS').length;
    return Math.round((successCount / logs.length) * 100);
  };

  /* =======================
     UI
  ======================= */

  return (
    <Layout>
      <div className="px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Notification Logs
          </h1>
          <p className="text-gray-600 mt-2">
            Track and monitor notification delivery status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">
              Total Notifications
            </p>
            <p className="text-4xl font-bold text-gray-800 mt-2">
              {logs.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Successful</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {logs.filter(log => log.status === 'SUCCESS').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Success Rate</p>
            <p className="text-4xl font-bold text-[#FF1774] mt-2">
              {getSuccessRate()}%
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-600" size={20} />
            <label className="text-sm font-medium text-gray-700">
              Filter by Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={e => setSelectedCampaign(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.campaign_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            <p className="mt-4 text-gray-600">Loading notification logs...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Log ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notification Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map(log => (
                    <tr key={log.log_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-700">
                        {log.log_id.substring(0, 8)}...
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-700">
                        {log.user_id.substring(0, 8)}...
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {log.notification_type}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logs.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <p className="text-lg">No notification logs found.</p>
                {selectedCampaign && (
                  <p className="text-sm mt-2">
                    Try clearing the campaign filter
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}