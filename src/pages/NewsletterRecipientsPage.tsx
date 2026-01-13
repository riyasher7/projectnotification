import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

interface Recipient {
  user_id: string;
  name: string;
  email: string;
  city: string;
}

export function NewsletterRecipientsPage() {
  const { id: newsletterId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!newsletterId) {
      setError('Invalid newsletter id');
      setLoading(false);
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/newsletters/${newsletterId}/recipients`
    )
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to fetch recipients');
        }
        return res.json();
      })
      .then(data => {
        // Expected backend response:
        // { recipients: [...] }
        if (Array.isArray(data.recipients)) {
          setRecipients(data.recipients);
        } else {
          setRecipients([]);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load recipients');
        setRecipients([]);
      })
      .finally(() => setLoading(false));
  }, [newsletterId]);

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
                  {recipients.map(user => (
                    <tr key={user.user_id} className="border-t">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.city}</td>
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

