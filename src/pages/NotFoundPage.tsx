import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0F4C3A] mb-6">
        <span className="text-2xl font-bold font-mono">404</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
        The retail module or page you are trying to access does not exist or has been moved.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="rounded-xl h-10 px-4 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Go Back
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white rounded-xl h-10 px-4 text-xs font-semibold"
        >
          <Home className="w-4 h-4 mr-1.5" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
