import { useEffect, useState } from 'react';
import { Plus, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export type Order = {
    order_id: string;
    order_name: string;
    city_filter: string | null;
    status: 'DRAFT' | 'SENT';
    created_at: string;
    created_by: string;

};

export function NewsletterManagementPage() {
    const navigate = useNavigate();
    const { user, isViewer } = useAuth();

    const [Order, setOrder] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        city_filter: '',
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/orders`
            );

            if (!res.ok) throw new Error('Failed to fetch newsletters');

            const data: Order[] = await res.json();
            setOrder(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.user_id) {
            alert('User not authenticated');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/orders`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        news_name: formData.name,
                        city_filter: formData.city_filter || null,
                        created_by: user.user_id,
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to create newsletter');

            setShowModal(false);
            setFormData({ name: '', city_filter: ''});
            fetchOrders();
        } catch (error) {
            console.error(error);
            alert('Failed to create newsletter');
        }
    };


    return (
        <Layout>
            <div className="px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Newsletter Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Create and manage newsletters
                        </p>
                    </div>

                    {!isViewer && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>New Newsletter</span>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid gap-6">
                        {Order.map(Order => (
                            <div
                                key={Order.order_id}
                                className="bg-white rounded-xl shadow p-6"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                            {Order.order_name}
                                        </h3>

                                        <p className="text-sm mt-2">
                                            <b>Status:</b> {Order.status}
                                        </p>

                                        {Order.city_filter && (
                                            <p className="text-sm">
                                                <b>City:</b> {Order.city_filter}
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            <b>Created:</b>{' '}
                                            {new Date(Order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/newsletters/${Order.order_id}/preview`
                                                )
                                            }
                                            className="bg-blue-500 text-white px-3 py-2 rounded-lg"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {Order.status === 'DRAFT' && !isViewer && (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/newsletters/${Order.order_id}/send`
                                                    )
                                                }
                                                className="bg-green-500 text-white px-3 py-2 rounded-lg"
                                            >
                                                <Send size={16} />
                                                <span> Send </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {Order.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl">
                                No newsletters created yet.
                            </div>
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-xl p-6 w-full max-w-xl">
                            <h2 className="text-xl font-bold mb-4">Create Newsletter</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    placeholder="Newsletter Name"
                                    value={formData.name}
                                    onChange={e =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                    required
                                />

                                <input
                                    placeholder="City Filter (optional)"
                                    value={formData.city_filter}
                                    onChange={e =>
                                        setFormData({ ...formData, city_filter: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                />

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 border rounded py-2"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="flex-1 bg-pink-600 text-white rounded py-2"
                                    >
                                        Save as Draft
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}


