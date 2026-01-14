// src/types/message-templates.ts

export interface FollowupTemplate {
  id: string;
  subject?: string;
  content: string;
  template_type: 'followup';
  followup_sequence: number;
  followup_delay_hours: number;
  parent_template_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  subject: string;
  content: string;
  campaign_id: string;
  company_id: string;
  template_type: 'initial' | 'followup';
  parent_template_id?: string;
  followup_sequence?: number;
  followup_delay_hours?: number;
  is_global: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  followup_templates?: FollowupTemplate[];
  ai_generation_success?: boolean;
  ai_provider_used?: string;
  followup_count?: number;
}

export interface CreateMessageTemplateRequest {
  subject: string;
  content: string;
  company_id: string;
  campaign_id: string;
  template_type?: 'initial' | 'followup';
  is_global?: boolean;
  generate_followups?: boolean;
  ai_provider?: 'openai' | 'gemini';
  custom_instructions?: string;
}

export interface CreateMessageTemplateWithFollowupsRequest extends CreateMessageTemplateRequest {
  generate_followups: true;
  ai_provider?: 'openai' | 'gemini';
  custom_instructions?: string;
}

export interface UpdateMessageTemplateRequest {
  subject?: string;
  content?: string;
  is_global?: boolean;
}

export interface RegenerateFollowupsRequest {
  ai_provider?: 'openai' | 'gemini';
  custom_instructions?: string;
}

export interface MessageTemplateResponse extends MessageTemplate {
  followup_templates: FollowupTemplate[];
}