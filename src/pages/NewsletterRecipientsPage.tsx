import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface Recipient {
  user_id: string;
  name: string;
  email: string;
  city: string;
}

export function NewsletterRecipientsPage() {
  const { id: newsletterId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!newsletterId) {
      setError('Invalid newsletter id');
      setLoading(false);
      return;
    }

    fetchRecipients();
  }, [newsletterId]);

  const fetchRecipients = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/newsletters/${newsletterId}/recipients`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch recipients');
      }

      const data = await response.json();

      // Backend returns: { recipients: [...] }
      if (Array.isArray(data.recipients)) {
        setRecipients(data.recipients);
      } else {
        setRecipients([]);
      }

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load recipients');
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            <p className="mt-4 text-gray-600">Loading recipients...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Eligible Recipients
              </h2>
              <p className="text-gray-600 mt-2">
                {recipients.length}{' '}
                {recipients.length === 1 ? 'user' : 'users'} will receive this
                newsletter
              </p>
            </div>

            {recipients.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600">
                  No eligible recipients found for this newsletter
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Check newsletter filters or user preferences
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          City
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recipients.map(recipient => (
                        <tr
                          key={recipient.user_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {recipient.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {recipient.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {recipient.city}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
