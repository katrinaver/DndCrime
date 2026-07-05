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
type NewsPost struct {
	ID        string        `json:"id"`
	AuthorID  string        `json:"authorId"`
	Author    string        `json:"author"`
	Content   string        `json:"content"`
	Campaign  string        `json:"campaign,omitempty"`
	CreatedAt time.Time     `json:"createdAt"`
	Comments  []NewsComment `json:"comments"`
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
