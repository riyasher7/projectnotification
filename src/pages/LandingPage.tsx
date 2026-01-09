import { Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-pink-600 mb-4">Nykaa</h1>
          <p className="text-xl text-gray-600">Campaign Management Portal</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Employee Login */}
          <button
            onClick={() => navigate('/employee/login')}
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center group-hover:from-pink-600 group-hover:to-pink-700 transition-all">
                <Users className="text-white" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Employee Login
              </h2>
              <p className="text-gray-600 text-center">
                Access campaign management, user administration, and analytics
              </p>
            </div>
          </button>

          {/* User Preference Portal */}
          <button
            onClick={() => navigate('/user/login')}
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center group-hover:from-pink-600 group-hover:to-pink-700 transition-all">
                <Settings className="text-white" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                User Preference Portal
              </h2>
              <p className="text-gray-600 text-center">
                Manage your notification preferences and communication channels
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
