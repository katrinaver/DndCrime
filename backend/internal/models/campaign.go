package models

import "time"

type CampaignStatus string

const (
	CampaignActive    CampaignStatus = "active"
	CampaignPaused    CampaignStatus = "paused"
	CampaignCompleted CampaignStatus = "completed"
)

type CampaignMasterProfile struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	AvatarURL   string `json:"avatarUrl,omitempty"`
}

type Campaign struct {
	ID                  string         `json:"id"`
	Name                string         `json:"name"`
	MasterID            string         `json:"masterId"`
	MasterName          string         `json:"master"`
	MasterProfile       *CampaignMasterProfile `json:"masterProfile,omitempty"`
	PlayerIDs           []string       `json:"playerIds"`
	Players             int            `json:"players"`
	Place               string         `json:"place"`
	Setting             string         `json:"setting"`
	MaxPlayers          int            `json:"maxPlayers"`
	Level               string         `json:"level"`
	ExtraParams         string         `json:"extraParams"`
	AntiAchievementPool []string       `json:"antiAchievementPool"`
	SessionDate         string         `json:"sessionDate,omitempty"`
	SessionTime         string         `json:"sessionTime,omitempty"`
	LastSession         string         `json:"lastSession,omitempty"`
	Status              CampaignStatus `json:"status"`
	InvitationPostID    string         `json:"invitationPostId,omitempty"`
	CreatedAt           time.Time      `json:"createdAt"`
	UpdatedAt           time.Time      `json:"updatedAt"`
}

// CampaignInvitePreview — ограниченная карточка кампании для страницы
// приглашения: доступна любому авторизованному пользователю по ссылке,
// поэтому не содержит место встреч и состав партии.
type CampaignInvitePreview struct {
	CampaignID string                `json:"campaignId"`
	Name       string                `json:"name"`
	Master     CampaignMasterProfile `json:"master"`
	Setting    string                `json:"setting"`
	Level      string                `json:"level"`
	Players    int                   `json:"players"`
	MaxPlayers int                   `json:"maxPlayers"`
	Status     CampaignStatus        `json:"status"`
	IsMember   bool                  `json:"isMember"`
}

type CreateCampaignRequest struct {
	Name                string                      `json:"name"`
	SessionDate         string                      `json:"sessionDate"`
	SessionTime         string                      `json:"sessionTime"`
	Place               string                      `json:"place"`
	Setting             string                      `json:"setting"`
	MaxPlayers          int                         `json:"maxPlayers"`
	Level               string                      `json:"level"`
	ExtraParams         string                      `json:"extraParams"`
	AntiAchievementPool []string                    `json:"antiAchievementPool"`
	Questionnaire       []QuestionnaireFieldSetting `json:"questionnaireSettings,omitempty"`
	QuestionnaireFields []QuestionnaireField        `json:"questionnaireFields,omitempty"`
}

type UpdateCampaignRequest struct {
	Name                string         `json:"name"`
	Place               string         `json:"place"`
	Setting             string         `json:"setting"`
	MaxPlayers          int            `json:"maxPlayers"`
	Level               string         `json:"level"`
	ExtraParams         string         `json:"extraParams"`
	AntiAchievementPool []string       `json:"antiAchievementPool"`
	SessionDate         string         `json:"sessionDate"`
	SessionTime         string         `json:"sessionTime"`
	LastSession         string         `json:"lastSession"`
	Status              CampaignStatus `json:"status"`
}
