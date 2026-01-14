import { useEffect, useState } from 'react';
import { Plus, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export function NewsletterManagementPage() {
  const navigate = useNavigate();
  const { user, isViewer, getAuthHeaders } = useAuth();

  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
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
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/newsletters`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch newsletters');
      }

      const data: Newsletter[] = await response.json();
      setNewsletters(data);
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
        `${import.meta.env.VITE_API_BASE_URL}/newsletters`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            news_name: formData.name,
            city_filter: formData.city_filter || null,
            content: formData.content,
            created_by: user.user_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create newsletter');
      }

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Newsletter Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage your newsletters
            </p>
          </div>

          {!isViewer && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>New Newsletter</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            <p className="mt-4 text-gray-600">Loading newsletters...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {newsletters.map(newsletter => (
              <div
                key={newsletter.newsletter_id}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  {/* Left */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-xl font-bold text-pink-600">
                        {newsletter.news_name}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          newsletter.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {newsletter.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-gray-700 text-sm">
                      {newsletter.city_filter && (
                        <p>
                          <span className="font-semibold">City Filter:</span>{' '}
                          {newsletter.city_filter}
                        </p>
                      )}

                      <p>
                        <span className="font-semibold">Content:</span>{' '}
                        {newsletter.content}
                      </p>

                      <p>
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(newsletter.created_at).toLocaleDateString()}
                      </p>

                      {newsletter.status === 'SENT' && (
                        <p>
                          <span className="font-semibold">Sent:</span>{' '}
                          {new Date(newsletter.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex space-x-3 ml-4">
                    <button
                      onClick={() =>
                        navigate(
                          `/newsletters/${newsletter.newsletter_id}/preview`
                        )
                      }
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                      <span>Preview</span>
                    </button>

                    {newsletter.status === 'DRAFT' && !isViewer && (
                      <button
                        onClick={() =>
                          navigate(
                            `/newsletters/${newsletter.newsletter_id}/send`
                          )
                        }
                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                      >
                        <Send size={18} />
                        <span>Send</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {newsletters.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600">
                  No newsletters yet. Create your first newsletter!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Create New Newsletter
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Newsletter Name
                  </label>
                  <input
                    placeholder="Enter newsletter name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City Filter (Optional)
                  </label>
                  <input
                    placeholder="Enter city name"
                    value={formData.city_filter}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        city_filter: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Newsletter Content
                  </label>
                  <textarea
                    placeholder="Enter newsletter content"
                    value={formData.content}
                    onChange={e =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ name: '', city_filter: '', content: '' });
                    }}
                    className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg py-2 transition-colors"
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