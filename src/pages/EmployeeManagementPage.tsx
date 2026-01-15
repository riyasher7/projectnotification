import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

interface Employee {
  user_id: string;  // ✅ Changed from number to string
  name: string;
  email: string;
  role_id: number;
}

const roleMap: Record<number, string> = {
  1: 'Admin',
  2: 'Creator',
  3: 'Viewer',
};

export function EmployeeManagementPage() {
  const navigate = useNavigate();
  const { getAuthHeaders, user } = useAuth();  // ✅ Get current user
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);  // ✅ Track which employee is being deleted

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: 1,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:9100/admin/employeesmgmt',
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        navigate('/login');
        return;
      }
      
      if (response.status === 403) {
        alert('You do not have permission to access this page');
        navigate('/dashboard');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data: Employee[] = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees', err);
      alert('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        'http://localhost:9100/admin/employeesmgmt',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to create employee');
      }

      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role_id: 1 });
      fetchEmployees();
      alert('Employee created successfully');
    } catch (err: any) {
      console.error('Failed to create employee', err);
      alert(err.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const deleteEmployee = async (employeeId: string) => {  // ✅ Changed to string
    // ✅ Prevent deleting yourself
    if (employeeId === user?.user_id) {
      alert('You cannot delete yourself!');
      return;
    }

    if (!confirm('Are you sure you want to delete this employee?')) return;

    setDeleting(employeeId);  // ✅ Show loading state

    try {
      const response = await fetch(
        `http://localhost:9100/admin/employeesmgmt/${employeeId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to delete employee');
      }

      // ✅ Remove from UI immediately (optimistic update)
      setEmployees(prev => prev.filter(emp => emp.user_id !== employeeId));
      alert('Employee deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete employee', err);
      alert(err.message || 'Failed to delete employee');
      // ✅ Refresh on error to ensure UI is in sync
      fetchEmployees();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Layout>
      <div className="px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage admin, creator, and viewer accounts
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#FF1774] hover:bg-[#e0156a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Employee
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">No employees found</p>
            <p className="text-sm text-gray-500 mt-2">
              Click "Add Employee" to create one
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map(emp => (
                    <tr
                      key={emp.user_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {emp.user_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {emp.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            emp.role_id === 1
                              ? 'bg-purple-100 text-purple-800'
                              : emp.role_id === 2
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {roleMap[emp.role_id] ?? 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => deleteEmployee(emp.user_id)}
                          disabled={deleting === emp.user_id || emp.user_id === user?.user_id}
                          className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={emp.user_id === user?.user_id ? "Cannot delete yourself" : "Delete employee"}
                        >
                          {deleting === emp.user_id ? (
                            <span className="inline-block animate-spin">⏳</span>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Modal - same as before */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Create Employee
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={formData.role_id}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      role_id: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Creator</option>
                  <option value={3}>Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', email: '', password: '', role_id: 1 });
                  }}
                  disabled={creating}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createEmployee}
                  disabled={creating}
                  className="bg-[#FF1774] hover:bg-[#e0156a] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}