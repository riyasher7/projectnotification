import { useEffect, useState } from 'react';
import { Send, Package } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export type Order = {
  order_id: string;
  order_name: string;
  user_id: string;
  status: 'PLACED' | 'UPDATE_REQUESTED' | 'SENT';
  created_at: string;
};

export function OrderManagementPage() {
  const { isViewer, getAuthHeaders } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingUpdate, setSendingUpdate] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/orders`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const sendUpdate = async (userId: string, orderId: string) => {
    if (!confirm('Send order update to this user?')) return;

    setSendingUpdate(orderId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}/orders/${orderId}/send-update`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send update');
      }

      // Optimistic UI update
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId ? { ...order, status: 'SENT' } : order
        )
      );

      alert('Order update sent successfully!');
    } catch (error) {
      console.error('Error sending update:', error);
      alert('Failed to send update');
    } finally {
      setSendingUpdate(null);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-100 text-blue-800';
      case 'UPDATE_REQUESTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'SENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PLACED':
        return '📦';
      case 'UPDATE_REQUESTED':
        return '🔔';
      case 'SENT':
        return '✅';
      default:
        return '❓';
    }
  };

  return (
    <Layout>
      <div className="px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Order Management
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage user order update requests
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {orders.length}
                </p>
              </div>
              <Package className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Placed</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {orders.filter(o => o.status === 'PLACED').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">
              Update Requested
            </p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {orders.filter(o => o.status === 'UPDATE_REQUESTED').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Sent</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {orders.filter(o => o.status === 'SENT').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map(order => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-xl text-gray-800">
                        {order.order_name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Order ID:</span>{' '}
                        <span className="font-mono">{order.order_id}</span>
                      </p>

                      <p>
                        <span className="font-semibold">User ID:</span>{' '}
                        <span className="font-mono">{order.user_id}</span>
                      </p>

                      <p>
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {!isViewer && order.status === 'UPDATE_REQUESTED' && (
                    <button
                      onClick={() => sendUpdate(order.user_id, order.order_id)}
                      disabled={sendingUpdate === order.order_id}
                      className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                    >
                      <Send size={16} />
                      <span>
                        {sendingUpdate === order.order_id
                          ? 'Sending...'
                          : 'Send Update'}
                      </span>
                    </button>
                  )}

                  {order.status === 'SENT' && (
                    <div className="flex items-center gap-2 text-green-600 font-medium ml-4">
                      <Send size={16} />
                      <span className="text-sm">Update Sent</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}