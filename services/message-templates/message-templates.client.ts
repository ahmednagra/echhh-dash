// src/services/message-templates/message-templates.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  MessageTemplate, 
  CreateMessageTemplateRequest,
  CreateMessageTemplateWithFollowupsRequest,
  UpdateMessageTemplateRequest,
  RegenerateFollowupsRequest
} from '@/types/message-templates';

export async function createMessageTemplate(data: CreateMessageTemplateRequest): Promise<MessageTemplate> {
  try {
    console.log('🚀 Client Service: Starting createMessageTemplate call');
    console.log('📋 Client Service: Template data:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('createMessageTemplate can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = '/api/v0/message-templates';
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.post<MessageTemplate>(endpoint, data);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No valid template data received');
      throw new Error('Failed to create message template');
    }
    
    console.log('✅ Client Service: Successfully created message template');
    console.log('📊 Client Service: Template data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in createMessageTemplate:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

export async function createMessageTemplateWithFollowups(data: CreateMessageTemplateWithFollowupsRequest): Promise<MessageTemplate> {
  try {
    console.log('🚀 Client Service: Starting createMessageTemplateWithFollowups call');
    console.log('📋 Client Service: Template data with AI followups:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('createMessageTemplateWithFollowups can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = '/api/v0/message-templates/with-followups';
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const requestData = {
      ...data,
      generate_followups: true,
      ai_provider: data.ai_provider || 'openai'
    };
    
    const response = await nextjsApiClient.post<MessageTemplate>(endpoint, requestData);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      followupsCount: response.data?.followup_templates?.length || 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      
      if (response.error.message?.includes('AI service error') || response.error.message?.includes('AI Generation Failed')) {
        console.warn('⚠️ Client Service: AI followup generation failed, but template was saved');
        throw new Error(`Template saved but AI followups failed: ${response.error.message}`);
      } else {
        throw new Error(response.error.message);
      }
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No valid template data received');
      throw new Error('Failed to create message template with followups');
    }
    
    console.log('✅ Client Service: Successfully created message template with followups');
    console.log('📊 Client Service: Template data:', {
      id: response.data.id,
      subject: response.data.subject,
      followupsGenerated: response.data.followup_templates?.length || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in createMessageTemplateWithFollowups:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

export async function getMessageTemplatesByCompany(companyId: string): Promise<MessageTemplate[]> {
  try {
    console.log(`🚀 Client Service: Starting getMessageTemplatesByCompany call for ${companyId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getMessageTemplatesByCompany can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/message-templates/company/${companyId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<MessageTemplate[]>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      templatesCount: Array.isArray(response.data) ? response.data.length : 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    const templates = response.data || [];
    console.log(`✅ Client Service: Successfully fetched ${templates.length} templates for company`);
    
    return templates;
  } catch (error) {
    console.error('💥 Client Service: Error in getMessageTemplatesByCompany:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

export async function getMessageTemplatesByCampaign(campaignId: string): Promise<MessageTemplate[]> {
  try {
    console.log(`🚀 Client Service: Starting getMessageTemplatesByCampaign call for ${campaignId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getMessageTemplatesByCampaign can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/message-templates/campaign/${campaignId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<MessageTemplate[]>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      templatesCount: Array.isArray(response.data) ? response.data.length : 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    const templates = response.data || [];
    console.log(`✅ Client Service: Successfully fetched ${templates.length} templates for campaign`);
    
    return templates;
  } catch (error) {
    console.error('💥 Client Service: Error in getMessageTemplatesByCampaign:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

export async function getMessageTemplatesByCampaignWithFollowups(campaignId: string): Promise<MessageTemplate[]> {
  try {
    console.log(`🚀 Client Service: Starting getMessageTemplatesByCampaignWithFollowups call for ${campaignId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getMessageTemplatesByCampaignWithFollowups can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/message-templates/campaign/${campaignId}/with-followups`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<MessageTemplate[]>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      templatesCount: Array.isArray(response.data) ? response.data.length : 0
    });
    
    if (response.error) {
      console.warn('⚠️ Client Service: Followups endpoint failed, falling back to regular templates');
      return await getMessageTemplatesByCampaign(campaignId);
    }
    
    const templates = response.data || [];
    console.log(`✅ Client Service: Successfully fetched ${templates.length} templates with followups for campaign`);
    
    templates.forEach((template) => {
      if (template.followup_templates && template.followup_templates.length > 0) {
        console.log(`📋 Template "${template.subject}" has ${template.followup_templates.length} followups`);
      }
    });
    
    return templates;
  } catch (error) {
    console.error('💥 Client Service: Error in getMessageTemplatesByCampaignWithFollowups:', error);
    console.warn('⚠️ Client Service: Falling back to regular campaign templates');
    
    try {
      return await getMessageTemplatesByCampaign(campaignId);
    } catch (fallbackError) {
      console.error('💥 Client Service: Fallback also failed:', fallbackError);
      throw error;
    }
  }
}

export async function getMessageTemplateById(templateId: string): Promise<MessageTemplate | null> {
  try {
    console.log(`🚀 Client Service: Starting getMessageTemplateById call for ${templateId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getMessageTemplateById can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/message-templates/${templateId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<MessageTemplate>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });
    
    if (response.error) {
      if (response.status === 404) {
        console.log('ℹ️ Client Service: Template not found (404)');
        return null;
      }
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No template data received');
      return null;
    }
    
    console.log('✅ Client Service: Successfully fetched template');
    console.log('📊 Client Service: Template data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getMessageTemplateById:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

export async function updateMessageTemplate(templateId: string, data: UpdateMessageTemplateRequest): Promise<MessageTemplate> {
  try {
    console.log(`🚀 Client Service: Starting updateMessageTemplate call for ${templateId}`);
    console.log('📋 Client Service: Update data:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('updateMessageTemplate can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/message-templates/${templateId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.put<MessageTemplate>(endpoint, data);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No updated template data received');
      throw new Error('Failed to update message template');
    }
    
    console.log('✅ Client Service: Successfully updated message template');
    console.log('📊 Client Service: Updated template data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateMessageTemplate:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

export async function deleteMessageTemplate(templateId: string): Promise<void> {
  try {
    console.log(`🚀 Client Service: Starting deleteMessageTemplate call for ${templateId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('deleteMessageTemplate can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/message-templates/${templateId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.delete(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      status: response.status
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Client Service: Successfully deleted message template');
  } catch (error) {
    console.error('💥 Client Service: Error in deleteMessageTemplate:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

export async function regenerateFollowups(templateId: string, data: RegenerateFollowupsRequest): Promise<MessageTemplate[]> {
  try {
    console.log(`🚀 Client Service: Starting regenerateFollowups call for ${templateId}`);
    console.log('📋 Client Service: Regeneration data:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('regenerateFollowups can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/message-templates/${templateId}/regenerate-followups`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const requestData = {
      ai_provider: data.ai_provider || 'openai',
      custom_instructions: data.custom_instructions
    };
    
    const response = await nextjsApiClient.post<MessageTemplate[]>(endpoint, requestData);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      followupsCount: Array.isArray(response.data) ? response.data.length : 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    const followups = response.data || [];
    console.log(`✅ Client Service: Successfully regenerated ${followups.length} followup templates`);
    
    return followups;
  } catch (error) {
    console.error('💥 Client Service: Error in regenerateFollowups:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}