import { useState, useEffect } from 'react';
import { mosqueApi } from '../../services/api';
import type { MosqueInfo as MosqueInfoType } from '../../types';

const MosqueInfo = () => {
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMosqueInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mosqueApi.getInfo();
        setMosqueInfo(data);
      } catch (err) {
        setError('Failed to load mosque information');
        console.error('Error fetching mosque info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMosqueInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!mosqueInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-teal-900 mb-6">Informasi Masjid</h2>
      
      {/* Mosque Header */}
      <div className="bg-teal-50 rounded-lg p-6 mb-6 text-center">
        {mosqueInfo.logo_url && (
          <img
            src={mosqueInfo.logo_url}
            alt={mosqueInfo.name}
            className="w-24 h-24 mx-auto mb-4 rounded-full"
          />
        )}
        <h3 className="text-2xl font-bold text-teal-900 mb-2">
          {mosqueInfo.name}
        </h3>
        <p className="text-gray-600">{mosqueInfo.description}</p>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-teal-900 mb-3">Kontak</h4>
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {mosqueInfo.address}
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {mosqueInfo.phone}
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {mosqueInfo.email}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-teal-900 mb-3">Jam Operasional</h4>
          <div className="space-y-2 text-gray-700">
            <div>Buka: 24/7</div>
            <div>Zona Waktu: {mosqueInfo.timezone}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MosqueInfo;
