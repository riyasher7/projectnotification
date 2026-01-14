import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Save,
  Mail,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type UserPreference = {
  user_id: string;
  city: string | null;
  offers: boolean;
  order_updates: boolean;
  newsletter: boolean;
  campaign_email: boolean;
  campaign_sms: boolean;
  campaign_push: boolean;
  newsletter_email: boolean;
  newsletter_sms: boolean;
  newsletter_push: boolean;
  update_email: boolean;
  update_sms: boolean;
  update_push: boolean;
};

type Campaign = {
  campaign_id: string;
  campaign_name: string;
  content: string;
  city_filter: string | null;
  status: 'DRAFT' | 'SENT';
};

type Newsletter = {
  newsletter_id: string;
  news_name: string;
  content: string;
  city_filter: string | null;
  status: 'DRAFT' | 'SENT';
};

type OrderStatus = 'PLACED' | 'UPDATE_REQUESTED' | 'SENT';

type Order = {
  order_id: string;
  order_name: string;
  status: OrderStatus;
};

type NotificationMessage = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export function UserPreferenceSettingsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, logout, getAuthHeaders } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const showNotification = (title: string, content: string) => {
    console.log('showNotification', { title, content });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const n: NotificationMessage = { id, title, content, createdAt: Date.now() };
    setNotifications(prev => [n, ...prev].slice(0, 6));
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== id));
    }, 10000);
  };

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
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
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log('WS message', data);
          if (data.type === 'CAMPAIGN' || data.type === 'NEWSLETTER') {
            showNotification(`📢 ${data.title}`, data.content);
          }
        } catch (err) {
          console.error('WS message parse error', err);
        }
      };

      ws.onclose = () => {
        console.log('WS closed', wsUrl);
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
      try { ws?.close(); } catch { /* ignore */ }
    };
  }, [userId]);

  const fetchData = async () => {
    try {
      // ✅ Add authentication headers to all requests
      const headers = getAuthHeaders();

      const prefRes = await fetch(
        `http://localhost:9100/users/${userId}/preferences`,
        { headers }
      );
      console.log(userId);
      if (!prefRes.ok) throw new Error('Failed to fetch preferences');

      const prefData: UserPreference = await prefRes.json();
      setPreferences(prefData);

      const campRes = await fetch(`http://localhost:9100/campaigns`, { headers });
      const campData: Campaign[] = campRes.ok ? await campRes.json() : [];

      const newsRes = await fetch(`http://localhost:9100/newsletters`, { headers });
      const newsData: Newsletter[] = newsRes.ok ? await newsRes.json() : [];

      const orderRes = await fetch(
        `http://localhost:9100/users/${userId}/orders`,
        { headers }
      );
      const orderData: Order[] = orderRes.ok ? await orderRes.json() : [];

      setOrders(orderData);

      if (prefData.offers) {
        setCampaigns(
          campData.filter(c =>
            c.status === 'SENT' &&
            (!c.city_filter ||
              c.city_filter.toLowerCase() === prefData.city?.toLowerCase())
          )
        );
      }

      if (prefData.newsletter) {
        setNewsletters(
          newsData.filter(n =>
            n.status === 'SENT' &&
            (!n.city_filter ||
              n.city_filter.toLowerCase() === prefData.city?.toLowerCase())
          )
        );
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!userId || !orderName.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:9100/users/${userId}/orders`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            order_name: orderName,
          }),
        }
      );

      if (!res.ok) throw new Error();

      const newOrder: Order = await res.json();

      setOrders(prev => [newOrder, ...prev]);
      setOrderName('');
      setShowOrderModal(false);
    } catch {
      alert('Failed to create order');
    }
  };

  type PreferenceToggleKey =
    | 'offers'
    | 'order_updates'
    | 'newsletter'

  type ChannelKey =
    | 'campaign_email'
    | 'campaign_sms'
    | 'campaign_push'
    | 'newsletter_email'
    | 'newsletter_sms'
    | 'newsletter_push'
    | 'update_email'
    | 'update_sms'
    | 'update_push';

  const toggle = (key: PreferenceToggleKey) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const toggleChannel = async (key: ChannelKey) => {
    if (!preferences || !userId) return;
    const prev = preferences;
    const updated = { ...prev, [key]: !prev[key] };

    setPreferences(updated);
    setMessage('');

    try {
      const res = await fetch(
        `http://localhost:9100/users/${userId}/preferences`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updated),
        }
      );
      if (!res.ok) throw new Error();
      setMessage('Preference updated');
    } catch {
      setPreferences(prev);
      setMessage('Failed to update preference');
    }
  };

  const handleSave = async () => {
    if (!preferences || !userId) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(
        `http://localhost:9100/users/${userId}/preferences`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(preferences),
        }
      );
      if (!res.ok) throw new Error();
      setMessage('Preferences saved successfully');
    } catch {
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const requestOrderUpdate = async (orderId: string) => {
    try {
      await fetch(
        `http://localhost:9100/users/${userId}/orders/${orderId}/request-update`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId
            ? { ...order, status: 'UPDATE_REQUESTED' }
            : order
        )
      );

      setMessage('Update requested');
    } catch {
      setMessage('Failed to request update');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const ChannelBadge = ({
    active,
    icon: Icon,
    label,
    onClick,
  }: {
    active: boolean;
    icon: any;
    label: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-2 ${
        active ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-400'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!preferences) {
    return <div className="text-center">Preferences not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
      {/* Notification toasts + WS status (top-right) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow">
          <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
          <div className="text-sm text-gray-600">{wsConnected ? 'Connected' : 'Disconnected'}</div>
          <button
            onClick={() => showNotification('Test notification', 'This is a local test')}
            className="ml-3 text-xs underline text-pink-600"
          >
            Test
          </button>
        </div>

        {notifications.map(n => (
          <div
            key={n.id}
            role="status"
            className="bg-white shadow-lg rounded-lg p-4 w-80 max-w-xs flex items-start gap-3 border"
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-pink-600">{n.title}</div>
              <div className="text-xs text-gray-600 mt-1">{n.content}</div>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
              className="text-gray-400 hover:text-gray-600 ml-2"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto py-8 space-y-10">
        <header className="flex justify-between items-center">
          <img src="/nykaa-logo.png" alt="Nykaa logo" className="w-40 h-auto" />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(s => !s)}
              className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow"
            >
              <div className="font-medium text-gray-700">{user?.name || `User ${userId}`}</div>
              <div className="text-gray-500">▾</div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 bg-white rounded shadow p-2 w-36">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-2 py-1 text-sm text-pink-600 hover:bg-pink-50 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= CAMPAIGNS ================= */}
        {preferences.offers && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Campaigns Available for You
              </h2>

              <div className="flex gap-2">
                <ChannelBadge active={preferences.campaign_email} icon={Mail} label="Email" onClick={() => toggleChannel('campaign_email')} />
                <ChannelBadge active={preferences.campaign_sms} icon={MessageSquare} label="SMS" onClick={() => toggleChannel('campaign_sms')} />
                <ChannelBadge active={preferences.campaign_push} icon={Bell} label="Push" onClick={() => toggleChannel('campaign_push')} />
              </div>
            </div>

            {campaigns.length === 0 ? (
              <p className="text-gray-600">
                No campaigns available for your city.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {campaigns.map(c => (
                  <div
                    key={c.campaign_id}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-xl font-semibold text-pink-600 mb-2">
                      {c.campaign_name}
                    </h3>
                    <p className="text-gray-600">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= NEWSLETTERS ================= */}
        {preferences.newsletter && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Newsletters Available for You
              </h2>

              <div className="flex gap-2">
                <ChannelBadge active={preferences.newsletter_email} icon={Mail} label="Email" onClick={() => toggleChannel('newsletter_email')} />
                <ChannelBadge active={preferences.newsletter_sms} icon={MessageSquare} label="SMS" onClick={() => toggleChannel('newsletter_sms')} />
                <ChannelBadge active={preferences.newsletter_push} icon={Bell} label="Push" onClick={() => toggleChannel('newsletter_push')} />
              </div>
            </div>

            {newsletters.length === 0 ? (
              <p className="text-gray-600">
                No newsletters available for your city.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {newsletters.map(n => (
                  <div
                    key={n.newsletter_id}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-xl font-semibold text-pink-600 mb-2">
                      {n.news_name}
                    </h3>
                    <p className="text-gray-600">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= ORDERS ================= */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Orders</h2>

            <button
              onClick={() => setShowOrderModal(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
            >
              Create Order
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-gray-600">You have no orders.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{order.order_name}</p>
                    <p className="text-sm text-gray-500">
                      Status: {order.status}
                    </p>
                  </div>

                  <button
                    onClick={() => requestOrderUpdate(order.order_id)}
                    disabled={order.status !== 'PLACED'}
                    className={`px-4 py-2 rounded-lg text-sm text-white
                      ${order.status === 'PLACED'
                        ? 'bg-pink-600 hover:bg-pink-700'
                        : 'bg-gray-300 cursor-not-allowed'
                      }`}
                  >
                    {order.status === 'UPDATE_REQUESTED'
                      ? 'Requested'
                      : order.status === 'SENT'
                        ? 'Sent'
                        : 'Request Update'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= PREFERENCES ================= */}
        <section className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-xl font-bold">Notification Preferences</h2>

          <div className="space-y-3">
            {[
              ['Receive Offers', 'offers'],
              ['Receive Order Updates', 'order_updates'],
              ['Receive Newsletter', 'newsletter'],
            ].map(([label, key]) => (
              <div key={key} className="flex justify-between items-center">
                <span>{label}</span>
                <button
                  onClick={() => toggle(key as PreferenceToggleKey)}
                  className={`h-6 w-11 rounded-full ${
                    preferences[key as PreferenceToggleKey]
                      ? 'bg-pink-600'
                      : 'bg-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>

          {message && (
            <div
              className={`text-sm text-center p-3 rounded-lg ${
                message.includes('success')
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-pink-600 text-white py-3 rounded-lg
                       flex justify-center items-center gap-2
                       hover:bg-pink-700 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </section>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Order</h2>

            <input
              type="text"
              placeholder="Enter order name"
              value={orderName}
              onChange={e => setOrderName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
              required
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={createOrder}
                className="px-4 py-2 bg-pink-600 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}