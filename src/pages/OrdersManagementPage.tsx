import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
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
  const { isViewer } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/orders`
      );

      if (!res.ok) throw new Error('Failed to fetch orders');

      const data: Order[] = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendUpdate = async (userId: string, orderId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}/orders/${orderId}/send-update`,
        { method: 'POST' }
      );

      if (!res.ok) throw new Error('Failed to send update');

      // Optimistic UI update
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId
            ? { ...order, status: 'SENT' }
            : order
        )
      );
    } catch (error) {
      console.error('Error sending update:', error);
      alert('Failed to send update');
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

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            No orders found.
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map(order => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.order_name}
                  </h3>

                  <p className="text-sm mt-2">
                    <b>Status:</b> {order.status}
                  </p>

                  <p className="text-sm"> 
                    <b>Created:</b>{' '}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>

                  <p className="text-sm">
                    <b>User ID:</b> {order.user_id}
                  </p>
                </div>

                {!isViewer && order.status === 'UPDATE_REQUESTED' && (
                  <button
                    onClick={() => sendUpdate(order.user_id, order.order_id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Send size={16} />
                    Send Update
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}



