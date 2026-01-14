// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  message?: string;
  variant?: 'neural' | 'quantum' | 'matrix' | 'pulse' | 'orbit' | 'wave' | 'echo' | 'echooo';
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'purple',
  fullScreen = false,
  message = 'Loading...',
  variant = 'echo'
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    sm: { 
      container: 'h-20 w-20', 
      text: 'text-sm',
      spacing: 'mt-4'
    },
    md: { 
      container: 'h-28 w-28', 
      text: 'text-base',
      spacing: 'mt-6'
    },
    lg: { 
      container: 'h-36 w-36', 
      text: 'text-lg',
      spacing: 'mt-8'
    },
  };

  // Color mapping
  const colorMap: Record<string, any> = {
    purple: {
      primary: 'purple-500',
      secondary: 'purple-400',
      accent: 'purple-600',
      gradient: 'from-purple-400 to-purple-600'
    },
    blue: {
      primary: 'blue-500',
      secondary: 'blue-400',
      accent: 'blue-600',
      gradient: 'from-blue-400 to-blue-600'
    },
    indigo: {
      primary: 'indigo-500',
      secondary: 'indigo-400',
      accent: 'indigo-600',
      gradient: 'from-indigo-400 to-indigo-600'
    },
  };

  const sizes = sizeMap[size];
  const colors = colorMap[color] || colorMap.purple;

  // Pulse Wave Loader (Clean & Modern)
  const PulseLoader = () => (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizes.container}`}>
        {/* Central core */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-r ${colors.gradient} rounded-full shadow-lg`}>
          <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
        </div>
        
        {/* Expanding rings */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-${colors.primary}/30 rounded-full animate-ping`}
            style={{
              width: `${30 + i * 15}px`,
              height: `${30 + i * 15}px`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          ></div>
        ))}
      </div>
      
      <div className={`${sizes.spacing} text-center`}>
        <p className={`${sizes.text} font-medium text-gray-700`}>{message}</p>
        <div className="flex justify-center mt-2 space-x-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-2 h-2 bg-${colors.primary} rounded-full animate-bounce`} style={{animationDelay: `${i * 0.15}s`}}></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Orbital System Loader
  const OrbitLoader = () => (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizes.container}`}>
        {/* Central star */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse shadow-2xl`}>
          <div className="absolute inset-1 bg-white/40 rounded-full"></div>
        </div>
        
        {/* Orbital paths */}
        {[1, 2, 3].map((orbit) => (
          <div key={orbit}>
            {/* Orbit ring */}
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-${colors.primary}/20 rounded-full`}
              style={{
                width: `${40 + orbit * 20}px`,
                height: `${40 + orbit * 20}px`
              }}
            ></div>
            
            {/* Orbiting planets */}
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin`}
              style={{
                width: `${40 + orbit * 20}px`,
                height: `${40 + orbit * 20}px`,
                animationDuration: `${2 + orbit * 0.5}s`
              }}
            >
              <div 
                className={`absolute w-2 h-2 bg-${colors.secondary} rounded-full shadow-lg`}
                style={{
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`${sizes.spacing} text-center`}>
        <p className={`${sizes.text} font-medium text-gray-700`}>{message}</p>
        <div className="flex justify-center mt-2">
          <div className={`h-1 w-16 bg-${colors.primary}/30 rounded-full overflow-hidden`}>
            <div className={`h-full w-1/3 bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Echo Logo Loader (Based on your image)
  const EchoLoader = () => (
    <div className="relative flex flex-col items-center">
    
      <div className={`${sizes.spacing} text-center`}>
        <p className={`${sizes.text} font-medium text-gray-700`}>{message}</p>
        <div className="flex justify-center mt-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-blue-600 via-purple-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideBar {
          0%, 100% { transform: translateX(-20px); opacity: 0.7; }
          50% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );

  // Echooo Text Loader
  const EchoooLoader = () => (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizes.container} flex items-center justify-center`}>
        <div className="text-center">
          {/* Echooo text with wave animation */}
          <div className="flex items-center justify-center space-x-1">
            {['e', 'c', 'h', 'o', 'o', 'o'].map((letter, i) => (
              <span
                key={i}
                className={`text-4xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}
                style={{
                  animation: `wave 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          
          {/* Pulsing dots under the 'ooo' */}
          <div className="flex justify-center mt-2 space-x-1">
            <div className="flex space-x-1 ml-20">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 bg-${colors.primary} rounded-full animate-bounce`}
                  style={{animationDelay: `${i * 0.2}s`}}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className={`${sizes.spacing} text-center`}>
        <p className={`${sizes.text} font-medium text-gray-700`}>{message}</p>
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            {Array.from('ECHO').map((letter, i) => (
              <span 
                key={i}
                className={`text-xs font-bold text-${colors.primary} animate-pulse`}
                style={{animationDelay: `${i * 0.15}s`}}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
  const WaveLoader = () => (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizes.container} flex items-center justify-center`}>
        {/* Wave bars */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`w-1 mx-0.5 bg-gradient-to-t ${colors.gradient} rounded-full animate-pulse`}
            style={{
              height: `${20 + Math.sin(i * 0.5) * 15}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.2s'
            }}
          ></div>
        ))}
      </div>
      
      <div className={`${sizes.spacing} text-center`}>
        <p className={`${sizes.text} font-medium text-gray-700`}>{message}</p>
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            {Array.from('LOADING').map((letter, i) => (
              <span 
                key={i}
                className={`text-xs font-mono text-${colors.primary} animate-pulse`}
                style={{animationDelay: `${i * 0.1}s`}}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Neural Network Loader
  const NeuralLoader = () => {
    // Pre-calculated static positions to avoid hydration issues
    const nodePositions = [
      { top: '90%', left: '50%' },    // 0 degrees
      { top: '65%', left: '84.6%' },  // 60 degrees  
      { top: '15%', left: '84.6%' },  // 120 degrees
      { top: '10%', left: '50%' },    // 180 degrees
      { top: '15%', left: '15.4%' },  // 240 degrees
      { top: '65%', left: '15.4%' }   // 300 degrees
    ];

    const linePositions = [
      { x2: '90%', y2: '50%' },       // 0 degrees
      { x2: '25%', y2: '13.4%' },     // 120 degrees  
      { x2: '25%', y2: '86.6%' }      // 240 degrees
    ];

    return (
      <div className="relative flex flex-col items-center">
        <div className={`relative ${sizes.container}`}>
          {/* Central node */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-${colors.primary} rounded-full animate-pulse shadow-lg`}></div>
          
          {/* Outer nodes */}
          {nodePositions.map((position, i) => (
            <div key={i} className="absolute inset-0 animate-spin" style={{animationDuration: `${2 + i * 0.3}s`}}>
              <div 
                className={`absolute w-3 h-3 bg-${colors.secondary} rounded-full animate-pulse`}
                style={{
                  top: position.top,
                  left: position.left,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            </div>
          ))}
          
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" style={{transform: 'rotate(0deg)', animation: 'spin 3s linear infinite'}}>
            {linePositions.map((line, i) => (
              <line
                key={i}
                x1="50%" y1="50%"
                x2={line.x2}
                y2={line.y2}
                stroke={`rgb(139 69 219 / 0.3)`}
                strokeWidth="1"
                className="animate-pulse"
              />
            ))}
          </svg>
        </div>
        
        <div className={`${sizes.spacing} text-center`}>
          <p className={`${sizes.text} font-medium text-gray-700`}>{message}</p>
          <div className="flex justify-center mt-2 space-x-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-2 h-2 bg-${colors.primary} rounded-full animate-bounce`} style={{animationDelay: `${i * 0.15}s`}}></div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Quantum Loader
  const QuantumLoader = () => (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizes.container}`}>
        {/* Quantum rings */}
        {[0, 1, 2].map((ring) => (
          <div
            key={ring}
            className={`absolute inset-0 border-2 border-${colors.primary}/30 rounded-full animate-spin`}
            style={{
              margin: `${ring * 8}px`,
              animationDuration: `${2 + ring * 0.5}s`,
              animationDirection: ring % 2 === 0 ? 'normal' : 'reverse'
            }}
          >
            <div 
              className={`absolute w-3 h-3 bg-gradient-to-r ${colors.gradient} rounded-full shadow-lg`}
              style={{
                top: '-6px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            ></div>
          </div>
        ))}
        
        {/* Center quantum particle */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse shadow-xl`}>
          <div className={`absolute inset-1 bg-white rounded-full opacity-50 animate-ping`}></div>
        </div>
      </div>
      
      <div className={`${sizes.spacing} text-center`}>
        <p className={`${sizes.text} font-medium text-gray-700`}>{message}</p>
        <div className="flex justify-center mt-2">
          <div className={`px-3 py-1 bg-gradient-to-r ${colors.gradient} text-white text-xs rounded-full animate-pulse`}>
            Processing
          </div>
        </div>
      </div>
    </div>
  );

  // Matrix Loader
  const MatrixLoader = () => (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizes.container}`}>
        {/* Matrix grid */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1 animate-pulse">
          {Array.from({length: 36}).map((_, i) => (
            <div 
              key={i}
              className={`w-full h-full bg-${colors.secondary}/20 rounded-sm animate-ping`}
              style={{
                animationDelay: `${(i * 0.1) % 2}s`,
                animationDuration: '1.5s'
              }}
            ></div>
          ))}
        </div>
        
        {/* Center loading bars */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-1 bg-gradient-to-t ${colors.gradient} rounded-full animate-pulse`}
              style={{
                height: `${20 + Math.sin(Date.now() * 0.01 + i) * 10}px`,
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Scanning line */}
        <div className={`absolute inset-0 border border-${colors.primary}/50 rounded animate-pulse`}>
          <div 
            className={`absolute w-full h-0.5 bg-gradient-to-r ${colors.gradient} opacity-70 animate-bounce`}
            style={{animationDuration: '2s'}}
          ></div>
        </div>
      </div>
      
      <div className={`${sizes.spacing} text-center`}>
        <p className={`${sizes.text} font-medium text-gray-700 font-mono`}>{message}</p>
        <div className="flex justify-center mt-2 font-mono text-xs">
          <span className={`text-${colors.primary} animate-pulse`}>{'>'} Ready_</span>
        </div>
      </div>
    </div>
  );

  const LoaderContent = () => {
    switch (variant) {
      case 'neural':
        return <NeuralLoader />;
      case 'quantum':
        return <QuantumLoader />;
      case 'matrix':
        return <MatrixLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'orbit':
        return <OrbitLoader />;
      case 'wave':
        return <WaveLoader />;
      case 'echo':
        return <EchoLoader />;
      case 'echooo':
        return <EchoooLoader />;
      default:
        return <PulseLoader />;
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 z-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent"></div>
        <LoaderContent />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-white z-40">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent"></div>
      <LoaderContent />
    </div>
  );
}