package models

import "time"

type CharacterCreationType string

const (
	CreationGeneral  CharacterCreationType = "general"
	CreationCampaign CharacterCreationType = "campaign"
	CreationClassic  CharacterCreationType = "classic"
)

type AbilityScores struct {
	Strength     int `json:"strength"`
	Dexterity    int `json:"dexterity"`
	Constitution int `json:"constitution"`
	Intelligence int `json:"intelligence"`
	Wisdom       int `json:"wisdom"`
	Charisma     int `json:"charisma"`
}

type Character struct {
	ID                   string                `json:"id"`
	OwnerID              string                `json:"ownerId"`
	Name                 string                `json:"name"`
	ClassName            string                `json:"className"`
	Level                int                   `json:"level"`
	Species              string                `json:"species"`
	Background           string                `json:"background"`
	PlayerName           string                `json:"playerName"`
	Alignment            string                `json:"alignment"`
	ExperiencePoints     int                   `json:"experiencePoints"`
	Abilities            AbilityScores         `json:"abilities"`
	ArmorClass           int                   `json:"armorClass"`
	Initiative           int                   `json:"initiative"`
	Speed                int                   `json:"speed"`
	MaxHP                int                   `json:"maxHp"`
	CurrentHP            int                   `json:"currentHp"`
	TempHP               int                   `json:"tempHp"`
	HitDice              string                `json:"hitDice"`
	ProficiencyBonus     int                   `json:"proficiencyBonus"`
	SavingThrows         []string              `json:"savingThrows"`
	Skills               []string              `json:"skills"`
	PersonalityTraits    string                `json:"personalityTraits"`
	Ideals               string                `json:"ideals"`
	Bonds                string                `json:"bonds"`
	Flaws                string                `json:"flaws"`
	Features             string                `json:"features"`
	Equipment            string                `json:"equipment"`
	Spells               string                `json:"spells"`
	CreationType         CharacterCreationType `json:"creationType"`
	CampaignID           string                `json:"campaignId,omitempty"`
	CampaignName         string                `json:"campaignName,omitempty"`
	QuestionnaireAnswers map[string]string     `json:"questionnaireAnswers,omitempty"`
	AntiAchievements     []AntiAchievement     `json:"antiAchievements,omitempty"`
	AvatarURL            string                `json:"avatarUrl,omitempty"`
	CreatedAt            time.Time             `json:"createdAt"`
	UpdatedAt            time.Time             `json:"updatedAt"`
}

// CharacterSummary — публичная карточка персонажа в кампании (без листа).
type CharacterSummary struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	ClassName        string            `json:"className"`
	Level            int               `json:"level"`
	Species          string            `json:"species"`
	PlayerName       string            `json:"playerName"`
	Alignment        string            `json:"alignment"`
	PersonalityTraits string           `json:"personalityTraits,omitempty"`
	AvatarURL        string            `json:"avatarUrl,omitempty"`
	AntiAchievements []AntiAchievement `json:"antiAchievements,omitempty"`
}

func (c *Character) ToSummary() CharacterSummary {
	return CharacterSummary{
		ID:                c.ID,
		Name:              c.Name,
		ClassName:         c.ClassName,
		Level:             c.Level,
		Species:           c.Species,
		PlayerName:        c.PlayerName,
		Alignment:         c.Alignment,
		PersonalityTraits: c.PersonalityTraits,
		AvatarURL:         c.AvatarURL,
		AntiAchievements:  c.AntiAchievements,
	}
}

type CharacterListItem struct {
	ID           string                `json:"id"`
	Name         string                `json:"name"`
	ClassName    string                `json:"className"`
	Level        int                   `json:"level"`
	Species      string                `json:"species"`
	CampaignName string                `json:"campaignName,omitempty"`
	CreationType CharacterCreationType `json:"creationType"`
	UpdatedAt    string                `json:"updatedAt"`
}

func (c *Character) ToListItem() CharacterListItem {
	return CharacterListItem{
		ID:           c.ID,
		Name:         c.Name,
		ClassName:    c.ClassName,
		Level:        c.Level,
		Species:      c.Species,
		CampaignName: c.CampaignName,
		CreationType: c.CreationType,
		UpdatedAt:    c.UpdatedAt.Format("2006-01-02"),
	}
}
