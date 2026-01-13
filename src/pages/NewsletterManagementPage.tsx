import { useEffect, useState } from 'react';
import { Plus, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export type Newsletter = {
    newsletter_id: string;
    newsletter_name: string;
    city_filter: string | null;
    content: string;
    status: 'draft' | 'sent';
    created_at: string;
    created_by: string;

};

export function NewsletterManagementPage() {
    const navigate = useNavigate();
    const { employee, isViewer } = useAuth();

    const [newsletter, setNewsletter] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        city_filter: '',
        content: '',
    });

    useEffect(() => {
        fetchNewsletters();
    }, []);

    const fetchNewsletters = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/newsletters`
            );

            if (!res.ok) throw new Error('Failed to fetch newsletters');

            const data: Newsletter[] = await res.json();
            setNewsletter(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!employee?.employee_id) {
            alert('User not authenticated');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/newsletters`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        newsletter_name: formData.name,
                        city_filter: formData.city_filter || null,
                        content: formData.content,
                        created_by: employee.employee_id,
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to create newsletter');

            setShowModal(false);
            setFormData({ name: '', city_filter: '', content: '' });
            fetchNewsletters();
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
                        {newsletter.map(newsletter => (
                            <div
                                key={newsletter.newsletter_id}
                                className="bg-white rounded-xl shadow p-6"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-pink-600">
                                            {newsletter.newsletter_name}
                                        </h3>

                                        <p className="text-sm mt-2">
                                            <b>Status:</b> {newsletter.status}
                                        </p>

                                        {newsletter.city_filter && (
                                            <p className="text-sm">
                                                <b>City:</b> {newsletter.city_filter}
                                            </p>
                                        )}

                                        <p className="text-sm">
                                            <b>Content:</b> {newsletter.content}
                                        </p>

                                        <p className="text-sm">
                                            <b>Created:</b>{' '}
                                            {new Date(newsletter.created_at).toLocaleDateString()}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            <b>Created By:</b> {newsletter.created_by}
                                        </p>

                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/newsletters/${newsletter.newsletter_id}/preview`
                                                )
                                            }
                                            className="bg-blue-500 text-white px-3 py-2 rounded-lg"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {newsletter.status === 'draft' && !isViewer && (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/newsletters/${newsletter.newsletter_id}/send`
                                                    )
                                                }
                                                className="bg-green-500 text-white px-3 py-2 rounded-lg"
                                            >
                                                <Send size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {newsletter.length === 0 && (
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

                                <textarea
                                    placeholder="Newsletter Content"
                                    value={formData.content}
                                    onChange={e =>
                                        setFormData({ ...formData, content: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                    rows={4}
                                    required
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


