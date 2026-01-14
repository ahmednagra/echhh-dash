// src/services/assignments/index.ts
export * from './assignments.client';
export * from './assignments.server';

// Export new functions with clear naming
export { 
  getAgentAssignments,
  getAgentAssignmentsById,
  getAssignmentInfluencers,
  getTodayAssignedInfluencers,
  recordContactAttempt
} from './assignments.client';

export { 
  getAgentAssignmentsServer,
  getAgentAssignmentsByIdServer,
  getAssignmentInfluencersServer,
  getTodayAssignedInfluencersServer,
  recordContactAttemptServer
} from './assignments.server';