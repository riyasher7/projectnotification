import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

interface Employee {
  user_id: number;
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: 1,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🔐 Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:9100/admin/employeesmgmt', {
        credentials: 'include',
      });

      if (res.status === 401) return navigate('/login');
      if (res.status === 403) return navigate('/unauthorized');

      const data: Employee[] = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Create employee
  const createEmployee = async () => {
    const res = await fetch('http://localhost:9100/admin/employeesmgmt', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      alert('Failed to create employee');
      return;
    }

    setShowModal(false);
    setFormData({name: '', email: '', phone: '',password: '', role_id: 1 });
    fetchEmployees();
  };

  // 🗑 Delete employee
  const deleteEmployee = async (employeeId: number) => {
    if (!confirm('Delete this employee?')) return;

    const res = await fetch(
      `http://localhost:9100/admin/employeesmgmt/${employeeId}`,
      { method: 'DELETE', credentials: 'include' }
    );

    if (!res.ok) {
      alert('Failed to delete employee');
      return;
    }

    fetchEmployees();
  };

  return (
    <Layout>
      <div className="px-4">
        <h1 className="text-3xl font-bold mb-6">Employee Management</h1>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#FF1774] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Employee
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map(emp => (
                  <tr key={emp.user_id}>
                    <td className="px-6 py-4">{emp.user_id}</td>
                    <td className="px-6 py-4">{emp.name}</td>
                    <td className="px-6 py-4">{emp.email}</td>
                    <td className="px-6 py-4">
                      {roleMap[emp.role_id] ?? 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteEmployee(emp.user_id)}
                        className="text-red-600 hover:text-red-800"
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

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-96 space-y-4">
              <h2 className="text-lg font-semibold">Create Employee</h2>

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <input
                type="password"
                className="w-full border px-3 py-2 rounded"
                placeholder="Password"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Phone"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <select
                className="w-full border px-3 py-2 rounded"
                value={formData.role_id}
                onChange={e =>
                  setFormData({ ...formData, role_id: Number(e.target.value) })
                }
              >
                <option value={1}>Admin</option>
                <option value={2}>Creator</option>
                <option value={3}>Viewer</option>
              </select>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  onClick={createEmployee}
                  className="bg-[#FF1774] text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
