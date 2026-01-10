import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

interface Recipient {
    user_id: string;
    name: string;
    email: string;
    city: string;
}

export function CampaignRecipientsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Invalid campaign id');
            setLoading(false);
            return;
        }

        fetch(`${import.meta.env.VITE_API_BASE_URL}/campaigns/${id}/recipients`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch recipients');
                }
                return res.json();
            })
            .then(data => {
                // ✅ NORMALIZE RESPONSE
                if (Array.isArray(data)) {
                    setRecipients(data);
                } else if (Array.isArray(data.data)) {
                    setRecipients(data.data);
                } else if (Array.isArray(data.eligible_users)) {
                    setRecipients(data.eligible_users);
                } else {
                    setRecipients([]);
                }
            })
            .catch(err => {
                console.error(err);
                setError('Something went wrong');
                setRecipients([]);
            })
            .finally(() => setLoading(false));
    }, [id]);


    return (
        <Layout>
            <div className="px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-pink-600"
                >
                    ← Back
                </button>

                {loading && <p>Loading...</p>}

                {error && <p className="text-red-600">{error}</p>}

                {!loading && !error && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">
                            Eligible Recipients ({recipients.length})
                        </h2>

                        {recipients.length === 0 ? (
                            <p>No users found</p>
                        ) : (
                            <table className="w-full border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">Name</th>
                                        <th className="p-2 text-left">Email</th>
                                        <th className="p-2 text-left">City</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(recipients) && recipients.map(u => (
                                        <tr key={u.user_id} className="border-t">
                                            <td className="p-2">{u.name}</td>
                                            <td className="p-2">{u.email}</td>
                                            <td className="p-2">{u.city}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}

