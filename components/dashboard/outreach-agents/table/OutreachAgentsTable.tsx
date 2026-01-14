// src/components/dashboard/outreach-agents/table/OutreachAgentsTable.tsx
'use client';

import React from 'react';
import { Users, RefreshCw } from 'react-feather';
import { OutreachAgent } from '@/types/outreach-agents';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

interface OutreachAgentsTableProps {
  agents: OutreachAgent[];
  loading: boolean;
  error: string | null;
}

const OutreachAgentsTable: React.FC<OutreachAgentsTableProps> = ({
  agents,
  loading,
  error
}) => {
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Use TableHeader Component */}
          <TableHeader />
          
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              // Loading State
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
                    <p className="text-sm text-gray-500">Loading agents...</p>
                  </div>
                </td>
              </tr>
            ) : agents.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first agent
                  </p>
                </td>
              </tr>
            ) : (
              // Render Agents using TableRow Component
              agents.map((agent) => (
                <TableRow key={agent.id} agent={agent} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutreachAgentsTable;