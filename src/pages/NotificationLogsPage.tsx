import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';


type Campaign = {
  campaign_id: string;
  campaign_name: string;
};

type User = {
  name: string;
  email: string;
};

type CampaignLog = {
  log_id: string;
  campaign_id: string;
  user_id: string;
  status: 'success' | 'failed';
  sent_at: string;
  campaigns?: Campaign;
  users?: User;
};


export function NotificationLogsPage() {
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchCampaigns();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedCampaign]);

  /* =======================
     Data Fetching
  ======================= */

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('campaign_id, campaign_name')
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notification_logs')
        .select(`
        log_id,
        status,
        sent_at,
        notification_type,
        user_id,
      `)
        .order('sent_at', { ascending: false });

      if (selectedCampaign) {
        query = query.eq('campaign_id', selectedCampaign);
      }

      const { data, error } = await query.returns<CampaignLog[]>();

      if (error) throw error;

      setLogs(data ?? []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };


  /* =======================
     Helpers
  ======================= */

  const getSuccessRate = () => {
    if (logs.length === 0) return 0;
    const successCount = logs.filter(log => log.status === 'success').length;
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
            <p className="text-gray-600 text-sm font-medium">
              Successful
            </p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {logs.filter(log => log.status === 'success').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">
              Success Rate
            </p>
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Campaigns</option>
              {campaigns.map(campaign => (
                <option
                  key={campaign.campaign_id}
                  value={campaign.campaign_id}
                >
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
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.log_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {log.campaigns?.campaign_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.users?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.users?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                No notification logs found.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
