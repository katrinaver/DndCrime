package models

import "time"

type NotificationType string

const (
	NotificationCampaignChatMessage NotificationType = "campaign_chat_message"
	NotificationNewsPost          NotificationType = "news_post"
	NotificationCalendarReminder  NotificationType = "calendar_reminder"
)

// Notification — уведомление для игрока.
type Notification struct {
	ID        string           `json:"id"`
	UserID    string           `json:"userId"`
	Type      NotificationType `json:"type"`
	Title     string           `json:"title"`
	Body      string           `json:"body"`
	Read      bool             `json:"read"`
	VisibleAt time.Time        `json:"visibleAt"`
	CreatedAt time.Time        `json:"createdAt"`

	CampaignID      string `json:"campaignId,omitempty"`
	CampaignName    string `json:"campaignName,omitempty"`
	ChatMessageID   string `json:"chatMessageId,omitempty"`
	NewsPostID      string `json:"newsPostId,omitempty"`
	CalendarEventID string `json:"calendarEventId,omitempty"`
	EventDate       string `json:"eventDate,omitempty"`
	EventTime       string `json:"eventTime,omitempty"`
	AuthorName      string `json:"authorName,omitempty"`
}

type NotificationListResponse struct {
	Items       []Notification `json:"items"`
	UnreadCount int            `json:"unreadCount"`
}
