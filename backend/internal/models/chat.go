package models

import "time"

type ChatType string

const (
	ChatTypeCampaign ChatType = "campaign"
	ChatTypeGeneral  ChatType = "general"
)

type Chat struct {
	ID         string    `json:"id"`
	Type       ChatType  `json:"type"`
	CampaignID string    `json:"campaignId,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
}

type ChatMessage struct {
	ID         string     `json:"id"`
	ChatID     string     `json:"chatId"`
	AuthorID   string     `json:"authorId"`
	AuthorName string     `json:"author"`
	Text       string     `json:"text"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  *time.Time `json:"updatedAt,omitempty"`
}

type CreateChatMessageRequest struct {
	Text string `json:"text"`
}

type UpdateChatMessageRequest struct {
	Text string `json:"text"`
}

// News feed (страница новостей).
type NewsPostKind string

const (
	NewsPostKindDefault        NewsPostKind = ""
	NewsPostKindCampaignInvite NewsPostKind = "campaign_invite"
)

type CampaignInviteMeta struct {
	CampaignName string         `json:"campaignName"`
	MasterName   string         `json:"masterName"`
	Place        string         `json:"place"`
	Setting      string         `json:"setting"`
	Level        string         `json:"level"`
	MaxPlayers   int            `json:"maxPlayers"`
	Players      int            `json:"players"`
	Status       CampaignStatus `json:"status"`
	SessionDate  string         `json:"sessionDate,omitempty"`
	SessionTime  string         `json:"sessionTime,omitempty"`
}

type NewsPost struct {
	ID         string              `json:"id"`
	AuthorID   string              `json:"authorId"`
	Author     string              `json:"author"`
	Content    string              `json:"content"`
	Campaign   string              `json:"campaign,omitempty"`
	CampaignID string              `json:"campaignId,omitempty"`
	Kind       NewsPostKind        `json:"kind,omitempty"`
	InviteMeta *CampaignInviteMeta `json:"inviteMeta,omitempty"`
	CreatedAt  time.Time           `json:"createdAt"`
	Comments   []NewsComment       `json:"comments"`
}

type NewsComment struct {
	ID        string    `json:"id"`
	PostID    string    `json:"postId"`
	AuthorID  string    `json:"authorId"`
	Author    string    `json:"author"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateNewsPostRequest struct {
	Content  string `json:"content"`
	Campaign string `json:"campaign,omitempty"`
}

type CreateNewsCommentRequest struct {
	Content string `json:"content"`
}
