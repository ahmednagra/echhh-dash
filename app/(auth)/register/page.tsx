// src/app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Users, Briefcase } from 'react-feather';
import InfluencerRegistrationForm from '@/components/auth/InfluencerRegistrationForm';
import CompanyRegistrationForm from '@/components/auth/CompanyRegistrationForm';

type RegisterTab = 'influencer' | 'company';

export default function Register() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [activeTab, setActiveTab] = useState<RegisterTab>('company');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      // Add animation delay
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);
  
  const handleRegistrationSuccess = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-6 py-12 relative">
        {/* Back to home link */}
        {/* <Link href="/" className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-purple-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link> */}
        
        <div className={`w-full max-w-md transform transition-all duration-700 ease-in-out ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center mb-8">
            <Image 
              src="/echooo-logo.svg" 
              alt="Echooo" 
              width={180} 
              height={50} 
              className="h-8 w-auto mx-auto mb-6" 
            />
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Your Account</h1>
            <p className="text-gray-600 mb-6">
              Join Echooo to connect with brands and influencers
            </p>
            
            {/* Tabs */}
            {/* <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
              <button
                onClick={() => setActiveTab('company')}
                className={`flex items-center justify-center space-x-2 flex-1 py-2 px-4 rounded-md transition ${
                  activeTab === 'company' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Briefcase size={18} />
                <span>Company</span>
              </button>
              <button
                onClick={() => setActiveTab('influencer')}
                className={`flex items-center justify-center space-x-2 flex-1 py-2 px-4 rounded-md transition ${
                  activeTab === 'influencer' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users size={18} />
                <span>Influencer</span>
              </button>
            </div> */}
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            {activeTab === 'influencer' ? (
              <InfluencerRegistrationForm onSuccess={handleRegistrationSuccess} />
            ) : (
              <CompanyRegistrationForm onSuccess={handleRegistrationSuccess} />
            )}
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side with illustration */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col h-full justify-center">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              {activeTab === 'influencer' 
                ? 'Grow Your Online Presence' 
                : 'Connect with Top Influencers'}
            </h2>
            <p className="text-xl text-purple-100">
              {activeTab === 'influencer'
                ? 'Join our network of influencers and connect with brands that match your values and audience.'
                : 'Find and collaborate with influencers who can authentically represent your brand and products.'}
            </p>
          </div>
          
          <div className="space-y-6">
            {activeTab === 'influencer' ? (
              // Influencer benefits
              <>
                {[
                  { title: "Get discovered", description: "Showcase your talents and reach brands looking for your unique style." },
                  { title: "Manage campaigns", description: "Track all your brand partnerships in one convenient dashboard." },
                  { title: "Grow your audience", description: "Access insights and tools to expand your reach and engagement." }
                ].map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 mt-1">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{feature.title}</h3>
                      <p className="text-purple-100 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Company benefits
              <>
                {[
                  { title: "Find perfect matches", description: "Discover influencers who align with your brand values and target audience." },
                  { title: "Manage campaigns", description: "Track performance and ROI across all your influencer partnerships." },
                  { title: "Measure results", description: "Get detailed analytics and insights to optimize your marketing strategy." }
                ].map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 mt-1">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{feature.title}</h3>
                      <p className="text-purple-100 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-5 right-5 text-white text-sm opacity-70">
          &copy; {new Date().getFullYear()} Echooo. All rights reserved.
        </div>
      </div>
    </div>
  );
}