// src/app/reports/page.tsx - Example Coming Soon page for Reports
import ComingSoon from '@/components/pages/ComingSoon';

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Advanced Reports"
      description="Comprehensive analytics and reporting tools are coming soon. Get detailed insights into your campaign performance, audience engagement, and ROI metrics."
      feature="Analytics & Reporting"
      showNotifyButton={true}
      expectedDate="Q2 2024"
      backLink="/dashboard"
      backLinkText="Back to Dashboard"
    />
  );
}