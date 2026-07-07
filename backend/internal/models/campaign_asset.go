package models

import "time"

type CampaignAssetType string

const (
	AssetTypeMap     CampaignAssetType = "map"
	AssetTypeHandout CampaignAssetType = "handout"
	AssetTypeNote    CampaignAssetType = "note"
	AssetTypeLink    CampaignAssetType = "link"
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

type CampaignMilestone struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Completed   bool       `json:"completed"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
	Order       int        `json:"order"`
}

type CampaignProgress struct {
	CampaignID     string              `json:"campaignId"`
	Summary        string              `json:"summary"`
	CurrentChapter string              `json:"currentChapter"`
	Milestones     []CampaignMilestone `json:"milestones"`
	UpdatedAt      time.Time           `json:"updatedAt"`
}

type SaveCampaignProgressRequest struct {
	Summary        string              `json:"summary"`
	CurrentChapter string              `json:"currentChapter"`
	Milestones     []CampaignMilestone `json:"milestones"`
}
