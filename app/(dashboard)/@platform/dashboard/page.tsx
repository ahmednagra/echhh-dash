// src/app/(dashboard)/@platform/dashboard/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import { getStoredAgentType } from '@/services/auth/auth.utils';

// Import agent-specific dashboards
import InstagramAgentDashboard from '@/components/dashboard/platform/InstagramAgentDashboard';
import EmailAgentDashboard from '@/components/dashboard/platform/EmailAgentDashboard';
import WhatsAppAgentDashboard from '@/components/dashboard/platform/WhatsAppAgentDashboard';
import PlatformAdminDashboard from '@/components/dashboard/platform/PlatformDashboard';

// Import from NEW dedicated location
import OutreachManagerDashboard from '@/components/outreach-manager/OutreachManagerDashboard';

// Create role-specific protected components for different agent types
const InstagramAgentDashboardProtected = withRoleAccess(InstagramAgentDashboard, {
  allowedRoles: ['platform_agent'],
  requiredPermissions: [{ resource: 'assigned_influencer', action: 'read' }]
});

const EmailAgentDashboardProtected = withRoleAccess(EmailAgentDashboard, {
  allowedRoles: ['platform_agent'],
  requiredPermissions: [{ resource: 'assigned_influencer', action: 'read' }]
});

const WhatsAppAgentDashboardProtected = withRoleAccess(WhatsAppAgentDashboard, {
  allowedRoles: ['platform_agent'],
  requiredPermissions: [{ resource: 'assigned_influencer', action: 'read' }]
});

const AdminDashboard = withRoleAccess(PlatformAdminDashboard, {
  allowedRoles: ['platform_super_admin', 'platform_admin'],
  requiredPermissions: [{ resource: 'user', action: 'read' }]
});

// Outreach Manager Dashboard protection
const OutreachManagerDashboardProtected = withRoleAccess(OutreachManagerDashboard, {
  allowedRoles: ['platform_outreach_manager'],
  requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }]
});

export default function PlatformDashboardPage() {
  const { getPrimaryRole } = useAuth();
  const primaryRole = getPrimaryRole();
  const agentType = getStoredAgentType();
  
  console.log('🎯 Platform Dashboard Page: Routing decision', {
    primaryRole,
    agentType,
    timestamp: new Date().toISOString()
  });

  // Outreach Manager routing
  if (primaryRole === 'platform_outreach_manager') {
    console.log('👔 Routing platform_outreach_manager to Outreach Manager Dashboard');
    return <OutreachManagerDashboardProtected />;
  }

  // Agent-specific routing for platform_agent role
  if (primaryRole === 'platform_agent') {
    console.log('👤 Routing platform_agent to agent-specific dashboard:', agentType);
    
    switch (agentType) {
      case 'instagram':
        return <InstagramAgentDashboardProtected />;
      case 'email':
        return <EmailAgentDashboardProtected />;
      case 'whatsapp':
        return <WhatsAppAgentDashboardProtected />;
      default:
        console.warn('⚠️ Unknown agent type, showing default dashboard');
        return <InstagramAgentDashboardProtected />;
    }
  }

  // Admin routing
  if (primaryRole === 'platform_super_admin' || primaryRole === 'platform_admin') {
    console.log('👑 Routing admin to Platform Admin Dashboard');
    return <AdminDashboard />;
  }

  // Default fallback
  console.log('📊 Routing to default Platform Admin Dashboard');
  return <AdminDashboard />;
}