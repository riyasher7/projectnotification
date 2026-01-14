import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

export type Newsletter = {
  newsletter_id: string;
  newsletter_name: string;
  city_filter: string | null;
  content: string;
  status: 'draft' | 'sent';
  created_at: string;
  created_by: string;
};

type NotificationMessage = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export function NewsletterSendPage() {
  const { id: newsletterId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const showNotification = (title: string, content: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const n: NotificationMessage = { id, title, content, createdAt: Date.now() };
    setNotifications(prev => [n, ...prev].slice(0, 6));
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== id)), 10000);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let heartbeatInterval: any = null;
    let mounted = true;

    const wsBase =
      import.meta.env.VITE_WS_BASE_URL ||
      (import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')
        : 'ws://localhost:9100');

    const wsUrl = `${wsBase.replace(/\/$/, '')}/ws/notifications/${userId}`;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WS connected', wsUrl);
        setWsConnected(true);
        heartbeatInterval = setInterval(() => {
          if (ws && ws.readyState === 1) {
            try { ws.send(JSON.stringify({ type: 'PING' })); } catch { /* ignore */ }
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WS message', data);
          if (data.type === 'NEWSLETTER' || data.type === 'CAMPAIGN') {
            showNotification(`📢 ${data.title}`, data.content || newsletter?.content || '');
          }
        } catch (err) {
          console.error('WS message parse error', err);
        }
      };

      ws.onclose = () => {
        console.log('WS closed, reconnecting...', wsUrl);
        setWsConnected(false);
        if (mounted) reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error('WS error', err);
        setWsConnected(false);
        try { ws?.close(); } catch { /* ignore */ }
      };
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      try { ws?.close(); } catch { /* ignore */ }
    };
  }, [userId, newsletter]);

  useEffect(() => {
    if (!newsletterId) return;
    fetchNewsletterAndRecipients();
  }, [newsletterId]);

  const fetchNewsletterAndRecipients = async () => {
    try {
      const { data: newsletterData, error: newsletterError } = await supabase
        .from('newsletters')
        .select('*')
        .eq('newsletter_id', newsletterId)
        .single();

      if (newsletterError) throw newsletterError;
      setNewsletter(newsletterData);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('user_id, city')
        .eq('is_active', true)
        .eq('role_id', 4);

      if (usersError) throw usersError;

      const cityFilter = newsletterData.city_filter?.toLowerCase();

      const filteredUsers =
        usersData?.filter(user => {
          if (!cityFilter) return true;
          return user.city?.toLowerCase() === cityFilter;
        }) || [];

      setUserCount(filteredUsers.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterId) return;

    setSending(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/newsletters/${newsletterId}/send`,
        { method: 'POST' }
      );

      if (!res.ok) {
        throw new Error('Failed to send newsletter');
      }

      const data = await res.json();

      setSentCount(data.sent_to);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="px-4">
        {/* Back */}
        <button
          onClick={() => navigate('/newsletters')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Newsletters</span>
        </button>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : !newsletter ? (
          <p className="text-center text-red-600">Newsletter not found</p>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-pink-600" size={40} />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Confirm Newsletter Send
                </h2>

                <p className="text-gray-600">
                  This action cannot be undone.
                </p>
              </div>

              {/* Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-5">
                <div>
                  <p className="text-sm text-gray-600">Newsletter Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {newsletter.newsletter_name}
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
                  <p className="text-gray-800 mt-2 whitespace-pre-wrap">
                    {newsletter.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/newsletters')}
                  disabled={sending}
                  className="flex-1 border border-gray-300 px-6 py-3 rounded-lg
                             hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendNewsletter}
                  disabled={sending || userCount === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700
                             text-white px-6 py-3 rounded-lg
                             flex items-center justify-center space-x-2
                             transition disabled:opacity-50"
                >
                  <Send size={20} />
                  <span>{sending ? 'Sending...' : 'Send Newsletter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Newsletter Sent
            </h2>

            <p className="mb-6 text-gray-600">
              Sent to <b>{sentCount}</b> users
            </p>

            <button
              onClick={() => navigate('/newsletters')}
              className="bg-pink-600 hover:bg-pink-700
                         text-white px-5 py-2.5 rounded-lg transition"
            >
              Back to Newsletters
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
