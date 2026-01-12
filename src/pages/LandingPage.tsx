import { Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="text-center mb-12">
            <img src="/nykaa-logo.png" alt="Nykaa logo" className="w-48 h-auto mb-4 mx-auto" />
            <p className="text-xl text-gray-600">Campaign Management Portal</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Employee Login */}
          <button
            onClick={() => navigate('/employee/login')}
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF1774] to-[#FF1774] rounded-full flex items-center justify-center group-hover:from-[#FF1774] group-hover:to-[#FF1774] transition-all">
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
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF1774] to-[#FF1774] rounded-full flex items-center justify-center group-hover:from-[#FF1774] group-hover:to-[#FF1774] transition-all">
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
