import { useNavigate } from 'react-router-dom';
import { Megaphone, Newspaper, Package } from 'lucide-react';
import { Layout } from '../components/Layout';

export function NotificationPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Notifications
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Campaigns */}
          <button
            onClick={() => navigate('/campaigns')}
            className="group bg-white rounded-2xl shadow-lg p-10 hover:shadow-xl transition-all border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Megaphone size={40} className="text-pink-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Campaign
              </h2>
              <p className="text-gray-600">
                Create and send promotional campaigns
              </p>
            </div>
          </button>

          {/* Order Updates */}
          <button
            onClick={() => navigate('/orders')}
            className="group bg-white rounded-2xl shadow-lg p-10 hover:shadow-xl transition-all border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Order Updates
              </h2>
              <p className="text-gray-600">
                Order updates and transactional alerts
              </p>
            </div>
          </button>

          {/* Offers */}
          <button
            onClick={() => navigate('/newsletters')}
            className="group bg-white rounded-2xl shadow-lg p-10 hover:shadow-xl transition-all border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Newspaper size={40} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Offers
              </h2>
              <p className="text-gray-600">
                Manage and send promotional offers
              </p>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
}
