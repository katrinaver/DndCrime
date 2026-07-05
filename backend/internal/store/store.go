package store

import (
	"time"

	"github.com/kate/dndcrime/internal/models"
)

type Store interface {
	// Profile
	GetProfile(userID string) (models.UserProfile, bool)
	SaveProfile(profile models.UserProfile) models.UserProfile

	// Notes
	GetNote(userID string) (models.Note, bool)
	SaveNote(note models.Note) models.Note

	// Campaigns
	ListCampaignsForUser(userID string) []models.Campaign
	GetCampaign(id string) (models.Campaign, bool)
	CreateCampaign(campaign models.Campaign, questionnaire models.CharacterQuestionnaire) models.Campaign
	IsCampaignMember(campaignID, userID string) bool

	// Questionnaire
	GetQuestionnaire(campaignID string) (models.CharacterQuestionnaire, bool)
	SaveQuestionnaire(q models.CharacterQuestionnaire) models.CharacterQuestionnaire

	// Characters
	ListCharactersByOwner(userID string) []models.Character
	ListCharactersByCampaign(campaignID string) []models.Character
	GetCharacter(id string) (models.Character, bool)
	CreateCharacter(c models.Character) models.Character
	UpdateCharacter(c models.Character) (models.Character, bool)
	DeleteCharacter(id, ownerID string) bool
	AddCharacterAchievement(characterID, ownerID string, achievement models.AntiAchievement) (models.Character, bool)

	// Chats
	GetCampaignChat(campaignID string) (models.Chat, bool)
	GetGeneralChat() (models.Chat, bool)
	ListChatMessages(chatID string) []models.ChatMessage
	GetChatMessage(messageID string) (models.ChatMessage, bool)
	CreateChatMessage(msg models.ChatMessage) models.ChatMessage
	UpdateChatMessage(messageID, text string) (models.ChatMessage, bool)
	DeleteChatMessage(messageID string) bool

	// News
	ListNewsPosts() []models.NewsPost
	GetNewsPost(id string) (models.NewsPost, bool)
	CreateNewsPost(post models.NewsPost) models.NewsPost
	AddNewsComment(postID string, comment models.NewsComment) (models.NewsPost, bool)

	// Calendar
	ListCalendarEventsForUser(userID string) []models.CalendarEvent
	CreateCalendarEvent(event models.CalendarEvent) models.CalendarEvent

	// Notifications
	ListNotifications(userID string) models.NotificationListResponse
	MarkNotificationRead(userID, notificationID string) (models.Notification, bool)
	MarkAllNotificationsRead(userID string) int
}

func Now() time.Time {
	return time.Now().UTC()
}
