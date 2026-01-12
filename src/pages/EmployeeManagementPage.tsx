import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

interface Employee {
  employee_id: number;
  email: string;
  role_id: number;
}

export function EmployeeManagementPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🔐 Fetch via backend (admin-protected)
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:9100/admin/employeesmgmt', {
        credentials: 'include', // cookie / session based auth
      });

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (res.status === 403) {
        navigate('/unauthorized');
        return;
      }

      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  // 🗑 Delete employee (admin-only backend route)
  const deleteEmployee = async (employeeId: number) => {
    if (!confirm('Delete this employee?')) return;

    const res = await fetch(
      `http://localhost:9100/admin/employeesmgmt/${employeeId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (res.ok) fetchEmployees();
  };

  return (
    <Layout>
      <div className="px-4">
        <h1 className="text-3xl font-bold mb-6">
          Employee Management
        </h1>
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={() => navigate('http://localhost:9100/admin/employeesmgmt')}
          className="bg-gradient-to-r from-[#FF1774] to-[#FF1774] text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
                  <th className="px-6 py-3 text-left text-xs font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {employees.map(emp => (
                  <tr key={emp.employee_id}>
                    <td className="px-6 py-4">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4">
                      {emp.role_id === 1 ? 'Admin' : 'Employee'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteEmployee(emp.employee_id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete employee"
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
      </div>
    </Layout>
  );
}

