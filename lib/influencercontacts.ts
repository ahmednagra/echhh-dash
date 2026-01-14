export const CONTACT_TYPES = [
  { id: 'email', name: 'Has Email' },
  { id: 'phone', name: 'Has Phone' },
  { id: 'snapchat', name: 'Has Snapchat' },
  { id: 'facebook', name: 'Has Facebook' },
  { id: 'youtube', name: 'Has YouTube' },
  { id: 'twitter', name: 'Has Twitter' },
  { id: 'telegram', name: 'Has Telegram' },
  { id: 'whatsapp', name: 'Has WhatsApp' },
  { id: 'linkedin', name: 'Has LinkedIn' },
  { id: 'vk', name: 'Has VK' },
  { id: 'bbm', name: 'Has BBM' },
  { id: 'kik', name: 'Has Kik' },
  { id: 'wechat', name: 'Has WeChat' },
  { id: 'viber', name: 'Has Viber' },
  { id: 'skype', name: 'Has Skype' },
  { id: 'tumblr', name: 'Has Tumblr' },
  { id: 'twitch', name: 'Has Twitch' },
  { id: 'kakao', name: 'Has KaKao' },
  { id: 'pinterest', name: 'Has Pinterest' }
] as const;

export type ContactType = typeof CONTACT_TYPES[number];