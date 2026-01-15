import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export type Newsletter = {
  newsletter_id: string;
  news_name: string;
  city_filter: string | null;
  content: string;
  status: 'DRAFT' | 'SENT';
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
  const { user, getAuthHeaders } = useAuth();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const showNotification = (title: string, content: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const n: NotificationMessage = { id, title, content, createdAt: Date.now() };
    setNotifications(prev => [n, ...prev].slice(0, 6));
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== id)), 10000);
  };

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
        setWsConnected(true);
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
          console.log('WS message', data);
          if (data.type === 'NEWSLETTER' || data.type === 'CAMPAIGN') {
            showNotification(`📢 ${data.title}`, data.content || '');
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
    if (!newsletterId) return;
    fetchNewsletterAndRecipients();
  }, [newsletterId]);

  const fetchNewsletterAndRecipients = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch newsletter details
      const newsletterRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/newsletters`,
        { headers }
      );

      if (!newsletterRes.ok) {
        throw new Error('Failed to fetch newsletter');
      }

      const newsletters: Newsletter[] = await newsletterRes.json();
      const foundNewsletter = newsletters.find(n => n.newsletter_id === newsletterId);

      if (!foundNewsletter) {
        throw new Error('Newsletter not found');
      }

      setNewsletter(foundNewsletter);

      // Fetch recipient count
      const recipientsRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/newsletters/${newsletterId}/recipients`,
        { headers }
      );

      if (!recipientsRes.ok) {
        throw new Error('Failed to fetch recipients');
      }

      const recipientsData = await recipientsRes.json();
      setUserCount(recipientsData.recipients?.length || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load newsletter data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterId) return;

    setSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/newsletters/${newsletterId}/send`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send newsletter');
      }

      const data = await response.json();

      setSentCount(data.sent_to || 0);
      setSuccessCount(data.success_count || 0);
      setFailedCount(data.failed_count || 0);
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
        {/* Notification toasts + WS status (top-right) */}
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow">
            <div
              className={`h-2 w-2 rounded-full ${
                wsConnected ? 'bg-green-400' : 'bg-gray-300'
              }`}
            />
            <div className="text-sm text-gray-600">
              {wsConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {notifications.map(n => (
            <div
              key={n.id}
              role="status"
              className="bg-white shadow-lg rounded-lg p-4 w-80 max-w-xs flex items-start gap-3 border"
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-pink-600">
                  {n.title}
                </div>
                <div className="text-xs text-gray-600 mt-1">{n.content}</div>
              </div>
              <button
                onClick={() =>
                  setNotifications(prev => prev.filter(x => x.id !== n.id))
                }
                className="text-gray-400 hover:text-gray-600 ml-2"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Back */}
        <button
          onClick={() => navigate('/newsletters')}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Newsletters</span>
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            <p className="mt-4 text-gray-600">Loading newsletter details...</p>
          </div>
        ) : !newsletter ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
              Newsletter not found
            </div>
          </div>
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
                  Are you sure you want to send this newsletter? This action
                  cannot be undone.
                </p>
              </div>

              {/* Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-5">
                <div>
                  <p className="text-sm text-gray-600">Newsletter Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {newsletter.news_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Eligible Recipients</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {userCount} Users
                  </p>
                </div>

                {newsletter.city_filter && (
                  <div>
                    <p className="text-sm text-gray-600">City Filter</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {newsletter.city_filter}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Message Content</p>
                  <p className="text-gray-800 mt-2 whitespace-pre-wrap">
                    {newsletter.content}
                  </p>
                </div>
              </div>

              {userCount === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                  ⚠️ No eligible recipients found. Check newsletter filters or
                  user preferences.
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/newsletters')}
                  disabled={sending}
                  className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendNewsletter}
                  disabled={sending || userCount === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-green-600" size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Newsletter Sent Successfully!
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-gray-600">
                Total Recipients:{' '}
                <span className="font-semibold text-gray-800">{sentCount}</span>
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
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View Logs
              </button>

              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/newsletters');
                }}
                className="flex-1 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
              >
                Back to Newsletters
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}