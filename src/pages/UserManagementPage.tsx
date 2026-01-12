import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase, User } from '../lib/supabase';

export function UserManagementPage() {
  const navigate = useNavigate();
  const [csvUploading, setCsvUploading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    gender: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingUser
      ? `http://localhost:9100/admin/users/${editingUser.user_id}`
      : 'http://localhost:9100/admin/users';

    const method = editingUser ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    setEditingUser(null);
    fetchUsers();
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase.from('users').delete().eq('user_id', id);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const toggleActive = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !user.is_active })
        .eq('user_id', user.user_id);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      city: user.city ?? '',
      gender: user.gender ?? '',
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const viewPreferences = (userId: string) => {
    navigate(`/users/${userId}/preferences`);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      'http://localhost:9100/admin/users/upload-csv',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!res.ok) {
      alert('CSV upload failed');
      return;
    }

    fetchUsers();
  };



  return (
    <Layout>
      <div className="px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your user base and their details
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-[#FF1774] to-[#FF1774] text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Add User
            </button>

            <label className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleCsvUpload}
              />
              Import CSV
            </label>
          </div>

        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FF1774] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FF1774] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FF1774] uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FF1774] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FF1774] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.city}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(user)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => navigate(`/user/${user.user_id}/preferences`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Preferences"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Full Name"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  value={formData.city}
                  onChange={e =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="City"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Phone Number"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <select
                  value={formData.gender}
                  onChange={e =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        city: '',
                        gender: '',
                        is_active: true,
                      });
                    }}
                    className="flex-1 border rounded-lg py-2"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 text-white rounded-lg py-2"
                  >
                    {editingUser ? 'Update' : 'Create'}
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

