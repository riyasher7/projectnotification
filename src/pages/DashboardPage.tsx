import { useEffect, useState } from 'react';
import { Users, UserCheck, Mail, Send } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalCampaigns: number;
  sentCampaigns: number;
  draftCampaigns: number;
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCampaigns: 0,
    sentCampaigns: 0,
    draftCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, campaignsRes] = await Promise.all([
        supabase.from('users').select('is_active', { count: 'exact' }).eq('role_id', 4),
        supabase.from('campaigns').select('status', { count: 'exact' }),
      ]);

      const totalUsers = usersRes.count || 0;
      const activeUsers =
        usersRes.data?.filter(u => u.is_active).length || 0;

      const totalCampaigns = campaignsRes.count || 0;
      const sentCampaigns =
        campaignsRes.data?.filter(c => c.status === 'sent').length || 0;
      const draftCampaigns =
        campaignsRes.data?.filter(c => c.status === 'draft').length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalCampaigns,
        sentCampaigns,
        draftCampaigns,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Total Campaigns', value: stats.totalCampaigns, icon: Mail, color: 'bg-purple-500' },
    { label: 'Sent Campaigns', value: stats.sentCampaigns, icon: Send, color: 'bg-pink-500' },
    { label: 'Draft Campaigns', value: stats.draftCampaigns, icon: Mail, color: 'bg-orange-500' },
  ];

  return (
    <Layout>
      <div className="px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your campaign management system
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map(card => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        {card.label}
                      </p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`${card.color} w-14 h-14 rounded-full flex items-center justify-center`}
                    >
                      <Icon className="text-white" size={28} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
