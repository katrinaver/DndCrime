package models

import "time"

type CampaignAssetType string

const (
	AssetTypeMap     CampaignAssetType = "map"
	AssetTypeHandout CampaignAssetType = "handout"
	AssetTypeNote    CampaignAssetType = "note"
	AssetTypeLink    CampaignAssetType = "link"
	AssetTypeFile    CampaignAssetType = "file"
)

type CampaignAsset struct {
	ID          string            `json:"id"`
	CampaignID  string            `json:"campaignId"`
	Title       string            `json:"title"`
	Type        CampaignAssetType `json:"type"`
	Description string            `json:"description"`
	URL         string            `json:"url,omitempty"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
}

type CreateCampaignAssetRequest struct {
	Title       string            `json:"title"`
	Type        CampaignAssetType `json:"type"`
	Description string            `json:"description"`
	URL         string            `json:"url,omitempty"`
}

type UpdateCampaignAssetRequest struct {
	Title       string            `json:"title"`
	Type        CampaignAssetType `json:"type"`
	Description string            `json:"description"`
	URL         string            `json:"url,omitempty"`
}

type CampaignProgressNote struct {
	ID         string    `json:"id"`
	Content    string    `json:"content"`
	AuthorID   string    `json:"authorId"`
	AuthorName string    `json:"authorName"`
	CreatedAt  time.Time `json:"createdAt"`
}

type CampaignMilestone struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Completed   bool       `json:"completed"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
	Order       int        `json:"order"`
}

type CampaignProgress struct {
	CampaignID     string                 `json:"campaignId"`
	CurrentChapter string                 `json:"currentChapter"`
	Notes          []CampaignProgressNote `json:"notes"`
	Summary        string                 `json:"summary,omitempty"`
	Milestones     []CampaignMilestone    `json:"milestones,omitempty"`
	UpdatedAt      time.Time              `json:"updatedAt"`
}

type SaveCampaignProgressRequest struct {
	CurrentChapter string `json:"currentChapter"`
}

type CreateCampaignProgressNoteRequest struct {
	Content string `json:"content"`
}
