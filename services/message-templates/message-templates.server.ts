// src/services/message-templates/message-templates.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  MessageTemplate, 
  CreateMessageTemplateRequest,
  CreateMessageTemplateWithFollowupsRequest,
  UpdateMessageTemplateRequest,
  RegenerateFollowupsRequest
} from '@/types/message-templates';

export async function getMessageTemplatesByCompanyServer(
  companyId: string, 
  authToken?: string
): Promise<MessageTemplate[]> {
  const response = await serverApiClient.get<MessageTemplate[]>(
    ENDPOINTS.MESSAGE_TEMPLATES.BY_COMPANY(companyId),
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data || [];
}

export async function getMessageTemplatesByCampaignServer(
  campaignId: string, 
  authToken?: string
): Promise<MessageTemplate[]> {
  const response = await serverApiClient.get<MessageTemplate[]>(
    ENDPOINTS.MESSAGE_TEMPLATES.BY_CAMPAIGN(campaignId),
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data || [];
}

export async function getMessageTemplatesByCampaignWithFollowupsServer(
  campaignId: string, 
  authToken?: string
): Promise<MessageTemplate[]> {
  const response = await serverApiClient.get<MessageTemplate[]>(
    ENDPOINTS.MESSAGE_TEMPLATES.BY_CAMPAIGN_WITH_FOLLOWUPS(campaignId),
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data || [];
}

export async function createMessageTemplateServer(
  data: CreateMessageTemplateRequest, 
  authToken?: string
): Promise<MessageTemplate> {
  const response = await serverApiClient.post<MessageTemplate>(
    ENDPOINTS.MESSAGE_TEMPLATES.CREATE,
    {
      ...data,
      is_global: data.is_global ?? true
    },
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  return response.data;
}

export async function createMessageTemplateWithFollowupsServer(
  data: CreateMessageTemplateWithFollowupsRequest, 
  authToken?: string
): Promise<MessageTemplate> {
  const response = await serverApiClient.post<MessageTemplate>(
    ENDPOINTS.MESSAGE_TEMPLATES.CREATE_WITH_FOLLOWUPS,
    {
      ...data,
      is_global: data.is_global ?? true,
      generate_followups: data.generate_followups ?? true,
      ai_provider: data.ai_provider ?? 'openai'
    },
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  return response.data;
}

export async function getMessageTemplateByIdServer(
  templateId: string, 
  authToken?: string
): Promise<MessageTemplate | null> {
  const response = await serverApiClient.get<MessageTemplate>(
    ENDPOINTS.MESSAGE_TEMPLATES.DETAIL(templateId),
    {},
    authToken
  );
  
  if (response.error) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(response.error.message);
  }
  
  return response.data;
}

export async function updateMessageTemplateServer(
  templateId: string,
  data: UpdateMessageTemplateRequest,
  authToken?: string
): Promise<MessageTemplate> {
  const response = await serverApiClient.put<MessageTemplate>(
    ENDPOINTS.MESSAGE_TEMPLATES.DETAIL(templateId),
    data,
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  return response.data;
}

export async function deleteMessageTemplateServer(
  templateId: string,
  authToken?: string
): Promise<void> {
  const response = await serverApiClient.delete(
    ENDPOINTS.MESSAGE_TEMPLATES.DETAIL(templateId),
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function regenerateFollowupsServer(
  templateId: string,
  data: RegenerateFollowupsRequest,
  authToken?: string
): Promise<MessageTemplate[]> {
  const response = await serverApiClient.post<MessageTemplate[]>(
    ENDPOINTS.MESSAGE_TEMPLATES.REGENERATE_FOLLOWUPS(templateId),
    {
      ai_provider: data.ai_provider ?? 'openai',
      custom_instructions: data.custom_instructions
    },
    {},
    authToken
  );
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data || [];
}