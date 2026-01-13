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

export function NewsletterSendPage() {
  const { id: newsletterId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (!newsletterId) return;
    fetchNewsletterAndRecipients();
  }, [newsletterId]);

  const fetchNewsletterAndRecipients = async () => {
    try {
      // ✅ Fetch newsletter
      const { data: newsletterData, error: newsletterError } = await supabase
        .from('newsletters')
        .select('*')
        .eq('newsletter_id', newsletterId)
        .single();

      if (newsletterError) throw newsletterError;
      setNewsletter(newsletterData);

      // ✅ Fetch active users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('user_id, city')
        .eq('is_active', true);

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
        <button
          onClick={() => navigate('/newsletters')}
          className="mb-6 flex items-center space-x-2 text-pink-600"
        >
          <ArrowLeft size={20} />
          <span>Back to Newsletters</span>
        </button>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : !newsletter ? (
          <p className="text-center text-red-600">Newsletter not found</p>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-yellow-600" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Confirm Newsletter Send
                </h2>
                <p className="text-gray-600">
                  This action cannot be undone.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
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
                  <p className="text-gray-800 mt-2">
                    {newsletter.content}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/newsletters')}
                  disabled={sending}
                  className="flex-1 border px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendNewsletter}
                  disabled={sending || userCount === 0}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Send size={20} />
                  <span>{sending ? 'Sending...' : 'Send Newsletter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-2">Newsletter Sent</h2>
            <p className="mb-6">
              Sent to <b>{sentCount}</b> users
            </p>

            <button
              onClick={() => navigate('/newsletters')}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Newsletters
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
