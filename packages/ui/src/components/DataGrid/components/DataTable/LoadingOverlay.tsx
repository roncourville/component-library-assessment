import React from 'react';

interface LoadingOverlayProps {
  text?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  text = "Loading data..." 
}) => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24">
          {/* Spinner ring */}
          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
          
          {/* Animated spinner */}
          <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 animate-spin"></div>
          
          {/* Inner spinner for additional effect */}
          <div className="absolute inset-4 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-blue-300 animate-spin" 
               style={{ animationDuration: '0.8s' }}></div>
          
          {/* Central dot */}
          <div className="absolute inset-8 rounded-full bg-blue-50 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-4 text-blue-600 font-medium">{text}</div>
        
        {/* Progress bar for additional visual feedback */}
        <div className="mt-2 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-progress-indeterminate"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;