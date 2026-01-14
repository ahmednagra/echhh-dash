// src/components/dashboard/campaign-funnel/discover/EmptyState.tsx
import Image from 'next/image';

interface EmptyStateProps {
  onStartDiscovery: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onStartDiscovery }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-xl shadow-sm">
      {/* Illustration */}
      <div className="relative w-40 h-40 mb-8">
        <div className="bg-gray-100 rounded-full w-40 h-20 mt-20 relative">
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="relative w-32 h-32">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto"></div>
              <div className="w-6 h-10 bg-gray-300 rounded-full absolute top-8 left-14"></div>
              <div className="absolute bottom-5 left-0">
                <div className="w-8 h-8 border-2 border-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-gray-200 absolute rounded-full left-2 top-4"></div>
                </div>
              </div>
              <div className="absolute bottom-5 right-0">
                <div className="w-8 h-8 border-2 border-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-gray-200 absolute rounded-full right-2 top-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text content */}
      <h2 className="text-2xl font-bold text-gray-700 mb-3">No Influencers Discovered Yet</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        No Influencers Discovered Yet. Click the button below to start discovering influencers
      </p>
      
      {/* CTA Button */}
      <button
        onClick={onStartDiscovery}
        className="px-8 py-4 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors shadow-md"
      >
        Discover Influencers Now
      </button>
    </div>
  );
};

export default EmptyState;