// src/app/page.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {

  const router = useRouter();
  const { isAuthenticated, getPrimaryRole } = useAuth();
  const primaryRole = getPrimaryRole();
  console.log('primaryRole', primaryRole)
  useEffect(() => {

    if (!isAuthenticated) {
      router.replace('/login'); // use replace to avoid adding to browser history
    } else {
      if(primaryRole == 'b2c_company_owner'){
        router.push('/campaigns');
      }else{
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated]);

  return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="absolute w-full h-full bg-pattern opacity-10"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Image 
              src="/echooo-logo.svg" 
              alt="Echooo" 
              width={200} 
              height={60} 
              className="mx-auto mb-6"
            />
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                Connect with the Right Influencers
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-purple-100">
              Echooo helps brands find and collaborate with influencers that align with their values and reach their target audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto">
                  Log In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-8 py-4 bg-purple-800 text-white rounded-full font-bold text-lg hover:bg-purple-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f9fafb" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,165.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Why Choose <span className="text-purple-600">Echooo</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">Curated Influencer Network</h3>
              <p className="text-gray-600 text-center">
                Access our vetted database of influencers across various niches and platforms.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">Campaign Analytics</h3>
              <p className="text-gray-600 text-center">
                Track performance metrics and ROI for all your influencer marketing campaigns.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">Smart Matching</h3>
              <p className="text-gray-600 text-center">
                Our AI-powered algorithm connects you with influencers most relevant to your brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Trusted by <span className="text-purple-600">Leading Brands</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Jane Doe</h4>
                  <p className="text-sm text-gray-600">Marketing Director, Tech Co.</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Echooo has transformed how we approach influencer marketing. The platform is intuitive and the results have exceeded our expectations."
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">MS</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Mark Smith</h4>
                  <p className="text-sm text-gray-600">CEO, Brand X</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Finding the right influencers used to be time-consuming. With Echooo, we've streamlined our process and seen amazing engagement."
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">AL</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Amanda Lee</h4>
                  <p className="text-sm text-gray-600">Influencer Relations, Beauty Inc.</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The analytics provided by Echooo give us incredible insights into our campaigns. It's changed how we measure success."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Influencer Marketing?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of brands that have elevated their marketing strategy with Echooo.
          </p>
          <Link href="/register">
            <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Image src="/echooo-logo.svg" alt="Echooo Logo" width={150} height={40} />
              </div>
              <p className="text-gray-400">
                Connecting brands with influential voices in the digital space.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">How it works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Echooo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}