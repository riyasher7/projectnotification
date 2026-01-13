import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

export type Newsletter = {
    newsletter_id: string;
    newsletter_name: string;
    city_filter: string | null;
    content: string;
    status: 'DRAFT' | 'SENT';
    created_at: string;
    created_by: string;
};

export function NewsletterPreviewPage() {
    const { id: newsletterId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!newsletterId) return;
        fetchNewsletter();
    }, [newsletterId]);

    const fetchNewsletter = async () => {
        try {
            const { data, error } = await supabase
                .from('newsletters')
                .select('*')
                .eq('newsletter_id', newsletterId)
                .single();

            if (error) throw error;
            setNewsletter(data);
        } catch (err) {
            console.error('Failed to fetch newsletter', err);
        } finally {
            setLoading(false);
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
                    <span>Back to Newsletters</span>
                </button>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
                    </div>
                ) : !newsletter ? (
                    <div className="text-center text-red-600">
                        Newsletter not found
                    </div>
                ) : (
                    <div className="max-w-4xl">
                        {/* Newsletter Details */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Newsletter Preview
                            </h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">Newsletter Name</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {newsletter.newsletter_name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${newsletter.status === 'SENT'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {newsletter.status}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">City Filter</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {newsletter.city_filter || 'All Cities'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Created On</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {new Date(newsletter.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created By (UUID)</p>
                                <p className="text-xs text-gray-500 break-all">
                                    {newsletter.created_by}
                                </p>
                            </div>

                            <div className="mt-6">
                                <p className="text-sm text-gray-600">Newsletter Content</p>
                                <p className="text-lg text-gray-800 mt-2 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                                    {newsletter.content}
                                </p>
                            </div>
                        </div>

                        {/* Send / Recipients */}
                        {newsletter.status === 'DRAFT' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Eligible Recipients
                                </h2>

                                <button
                                    onClick={() =>
                                        navigate(`/newsletters/${newsletter.newsletter_id}/recipients`)
                                    }
                                    className="bg-[#FF1774] hover:bg-[#FF1774] text-white px-6 py-3 rounded-lg font-medium"
                                >
                                    View Recipients
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
