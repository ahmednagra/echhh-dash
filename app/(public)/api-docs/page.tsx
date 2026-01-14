// src/app/api-docs/page.tsx - Example Coming Soon page for API Documentation
import ComingSoon from '@/components/pages/ComingSoon';

export default function ApiDocsPage() {
  return (
    <ComingSoon
      title="Developer API"
      description="Complete API documentation and developer tools for building custom integrations with the Echooo platform."
      feature="Developer Resources"
      showNotifyButton={false}
      expectedDate="Documentation in Progress"
      backLink="/dashboard"
      backLinkText="Back to Dashboard"
    />
  );
}