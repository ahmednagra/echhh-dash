// src/components/create-user/shared/StepIndicator.tsx
'use client';

import React from 'react';
import { Check } from 'react-feather';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle and Info */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300 z-10
                    ${isCompleted 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-500' 
                      : isCurrent 
                        ? 'bg-white border-purple-500 shadow-lg shadow-purple-500/30' 
                        : 'bg-white border-gray-300'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`
                        text-sm font-semibold
                        ${isCurrent ? 'text-purple-600' : 'text-gray-400'}
                      `}
                    >
                      {step.number}
                    </span>
                  )}

                  {/* Pulse effect for current step */}
                  {isCurrent && (
                    <>
                      <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping"></span>
                      <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    </>
                  )}
                </div>

                {/* Step Title and Description */}
                <div className="mt-3 text-center">
                  <p
                    className={`
                      text-sm font-medium transition-colors duration-300
                      ${isCurrent ? 'text-purple-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                    `}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`
                      text-xs mt-0.5 transition-colors duration-300
                      ${isCurrent ? 'text-purple-500' : 'text-gray-400'}
                    `}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-12 relative">
                  <div className="absolute inset-0 bg-gray-200"></div>
                  <div
                    className={`
                      absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500
                      transition-all duration-500
                      ${isCompleted ? 'w-full' : 'w-0'}
                    `}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}