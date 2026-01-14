import { useEffect, useState } from 'react';
import { Users, UserCheck, Mail, Send } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalCampaigns: number;
  sentCampaigns: number;
  draftCampaigns: number;
  totalNewsletters: number;
  sentNewsletters: number;
  draftNewsletters: number;
};

export function DashboardPage() {
  const { getAuthHeaders } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCampaigns: 0,
    sentCampaigns: 0,
    draftCampaigns: 0,
    totalNewsletters: 0,
    sentNewsletters: 0,
    draftNewsletters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch users (admin endpoint)
      const usersRes = await fetch('http://localhost:9100/admin/users', {
        headers
      });

      // Fetch campaigns
      const campaignsRes = await fetch('http://localhost:9100/campaigns', {
        headers
      });

      // Fetch newsletters
      const newslettersRes = await fetch('http://localhost:9100/newsletters', {
        headers
      });

      if (!usersRes.ok || !campaignsRes.ok || !newslettersRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const users = await usersRes.json();
      const campaigns = await campaignsRes.json();
      const newsletters = await newslettersRes.json();

      const totalUsers = users.length;
      const activeUsers = users.filter((u: any) => u.is_active).length;

      const totalCampaigns = campaigns.length;
      const sentCampaigns = campaigns.filter((c: any) => c.status === 'SENT').length;
      const draftCampaigns = campaigns.filter((c: any) => c.status === 'DRAFT').length;

      const totalNewsletters = newsletters.length;
      const sentNewsletters = newsletters.filter((n: any) => n.status === 'SENT').length;
      const draftNewsletters = newsletters.filter((n: any) => n.status === 'DRAFT').length;

      setStats({
        totalUsers,
        activeUsers,
        totalCampaigns,
        sentCampaigns,
        draftCampaigns,
        totalNewsletters,
        sentNewsletters,
        draftNewsletters,
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
    { label: 'Total Newsletters', value: stats.totalNewsletters, icon: Mail, color: 'bg-teal-500' },
    { label: 'Sent Newsletters', value: stats.sentNewsletters, icon: Send, color: 'bg-red-500' },
    { label: 'Draft Newsletters', value: stats.draftNewsletters, icon: Mail, color: 'bg-yellow-500' },
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