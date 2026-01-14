import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isCreator, isViewer } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin || isCreator || isViewer) {
        navigate('/dashboard');
      } else {
        navigate('/user-portal');
      }
    }
  }, [isAuthenticated, isAdmin, isCreator, isViewer, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <img
            src="/nykaa-logo.png"
            alt="Nykaa logo"
            className="w-48 h-auto mb-6 mx-auto"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Nykaa
          </h1>
          <p className="text-lg text-gray-600">Campaign Management Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-[#FF1774] to-[#FF1774] hover:from-[#e01569] hover:to-[#e01569] text-white py-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
          >
            <LogIn size={24} />
            <span className="text-lg font-semibold">Login</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New user?</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/signup')}
            className="w-full border-2 border-[#FF1774] text-[#FF1774] hover:bg-[#FF1774] hover:text-white py-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105"
          >
            <UserPlus size={24} />
            <span className="text-lg font-semibold">Sign Up</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Manage your notification campaigns and reach your customers
          effectively
        </p>
      </div>
    </div>
  );
}
