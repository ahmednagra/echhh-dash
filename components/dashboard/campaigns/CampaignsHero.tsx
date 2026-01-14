// src/components/dashboard/campaigns/CampaignsHero.tsx
'use client';

interface CampaignsHeroProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function CampaignsHero({ 
  title = "Welcome to Your Campaign Dashboard",
  subtitle = "Manage and track your influencer marketing campaigns",
  className = ""
}: CampaignsHeroProps) {
  return (
    <div className={`bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-2xl mx-6 pt-6 mt-6 h-64 flex items-center justify-center ${className}`}>
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-base opacity-90">{subtitle}</p>
      </div>
    </div>
  );
}