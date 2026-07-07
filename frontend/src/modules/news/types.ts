export interface NewsComment {
  id: string
  postId: string
  author: string
  content: string
  createdAt: string
}

export interface CampaignInviteMeta {
  campaignName: string
  masterName: string
  place: string
  setting: string
  level: string
  maxPlayers: number
  players: number
  status: 'active' | 'paused' | 'completed'
  sessionDate?: string
  sessionTime?: string
}

export interface NewsPost {
  id: string
  author: string
  authorId?: string
  content: string
  createdAt: string
  campaign?: string
  campaignId?: string
  kind?: 'campaign_invite' | ''
  inviteMeta?: CampaignInviteMeta
  comments: NewsComment[]
}
