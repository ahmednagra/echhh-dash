// ============================================
// 5. src/components/ui/UnauthorizedAccess.tsx
// ============================================
'use client';

import { AlertTriangle, ArrowLeft } from 'react-feather';
import { useRouter } from 'next/navigation';

interface UnauthorizedAccessProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function UnauthorizedAccess({
  title = "Access Restricted",
  message = "You don't have permission to access this page. Please contact your administrator if you need access to this feature.",
  showBackButton = true
}: UnauthorizedAccessProps) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-yellow-600" />
        </div>
        
        <h1 className="text-xl font-semibold text-yellow-900 mb-2">
          {title}
        </h1>
        
        <p className="text-yellow-700 mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}