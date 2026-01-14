// ============================================
// 10. src/components/settings/shared/SettingsCard.tsx
// ============================================
'use client';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function SettingsCard({ 
  title, 
  description, 
  icon, 
  children 
}: SettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          {icon && (
            <div className="mr-3 text-primary-600">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}