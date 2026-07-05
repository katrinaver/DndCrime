package store

import (
	"fmt"
	"time"

	"github.com/kate/dndcrime/internal/id"
	"github.com/kate/dndcrime/internal/models"
)

func (s *MemoryStore) ListNotifications(userID string) models.NotificationListResponse {
	s.mu.RLock()
	defer s.mu.RUnlock()

	now := Now()
	items := make([]models.Notification, 0)
	unread := 0

	for _, n := range s.notifications {
		if n.UserID != userID || n.VisibleAt.After(now) {
			continue
		}
		items = append(items, n)
		if !n.Read {
			unread++
		}
	}

	sortNotificationsDesc(items)
	return models.NotificationListResponse{Items: items, UnreadCount: unread}
}

func (s *MemoryStore) MarkNotificationRead(userID, notificationID string) (models.Notification, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	n, ok := s.notifications[notificationID]
	if !ok || n.UserID != userID {
		return models.Notification{}, false
	}
	n.Read = true
	s.notifications[notificationID] = n
	return n, true
}

func (s *MemoryStore) MarkAllNotificationsRead(userID string) int {
	s.mu.Lock()
	defer s.mu.Unlock()

	count := 0
	now := Now()
	for nid, n := range s.notifications {
		if n.UserID != userID || n.Read || n.VisibleAt.After(now) {
			continue
		}
		n.Read = true
		s.notifications[nid] = n
		count++
	}
	return count
}

func (s *MemoryStore) saveNotificationLocked(n models.Notification) models.Notification {
	now := Now()
	n.ID = id.New()
	n.CreatedAt = now
	if n.VisibleAt.IsZero() {
		n.VisibleAt = now
	}
	s.notifications[n.ID] = n
	return n
}

func (s *MemoryStore) emitCampaignChatNotificationsLocked(campaignID string, msg models.ChatMessage) {
	campaign, ok := s.campaigns[campaignID]
	if !ok {
		return
	}

	title := fmt.Sprintf("Новое сообщение в «%s»", campaign.Name)
	body := truncate(msg.Text, 120)

	for _, userID := range s.campaignMemberIDsLocked(campaignID) {
		if userID == msg.AuthorID {
			continue
		}
		s.saveNotificationLocked(models.Notification{
			UserID:        userID,
			Type:          models.NotificationCampaignChatMessage,
			Title:         title,
			Body:          body,
			CampaignID:    campaignID,
			CampaignName:  campaign.Name,
			ChatMessageID: msg.ID,
			AuthorName:    msg.AuthorName,
		})
	}
}

func (s *MemoryStore) emitNewsPostNotificationsLocked(post models.NewsPost) {
	title := "Новая запись в ленте"
	if post.Campaign != "" {
		title = fmt.Sprintf("Новость: %s", post.Campaign)
	}
	body := truncate(post.Content, 160)

	for _, userID := range s.allKnownUserIDsLocked() {
		if userID == post.AuthorID {
			continue
		}
		s.saveNotificationLocked(models.Notification{
			UserID:     userID,
			Type:       models.NotificationNewsPost,
			Title:      title,
			Body:       body,
			NewsPostID: post.ID,
			AuthorName: post.Author,
		})
	}
}

func (s *MemoryStore) emitCalendarReminderNotificationsLocked(event models.CalendarEvent) {
	if event.CampaignID == "" {
		return
	}

	campaign, ok := s.campaigns[event.CampaignID]
	if !ok {
		return
	}

	campaignName := event.Campaign
	if campaignName == "" {
		campaignName = campaign.Name
	}

	title := fmt.Sprintf("Завтра сессия: %s", campaignName)
	body := fmt.Sprintf("Кампания «%s» — %s", campaignName, event.Date)
	if event.Time != "" {
		body += " в " + event.Time
	}
	if event.Place != "" {
		body += " · " + event.Place
	}

	visibleAt := calendarReminderVisibleAt(event.Date)

	for _, userID := range s.campaignMemberIDsLocked(event.CampaignID) {
		s.saveNotificationLocked(models.Notification{
			UserID:          userID,
			Type:            models.NotificationCalendarReminder,
			Title:           title,
			Body:            body,
			CampaignID:      event.CampaignID,
			CampaignName:    campaignName,
			CalendarEventID: event.ID,
			EventDate:       event.Date,
			EventTime:       event.Time,
			VisibleAt:       visibleAt,
		})
	}
}

func (s *MemoryStore) campaignMemberIDsLocked(campaignID string) []string {
	c, ok := s.campaigns[campaignID]
	if !ok {
		return nil
	}
	return uniqueIDs(append([]string{c.MasterID}, c.PlayerIDs...))
}

func (s *MemoryStore) allKnownUserIDsLocked() []string {
	ids := make([]string, 0)
	for uid := range s.profiles {
		ids = append(ids, uid)
	}
	for _, c := range s.campaigns {
		ids = append(ids, c.MasterID)
		ids = append(ids, c.PlayerIDs...)
	}
	return uniqueIDs(ids)
}

func calendarReminderVisibleAt(eventDate string) time.Time {
	parsed, err := time.Parse("2006-01-02", eventDate)
	if err != nil {
		return Now()
	}
	return parsed.Add(-24 * time.Hour)
}

func truncate(text string, max int) string {
	runes := []rune(text)
	if len(runes) <= max {
		return text
	}
	return string(runes[:max-1]) + "…"
}

func uniqueIDs(ids []string) []string {
	seen := make(map[string]struct{}, len(ids))
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}

func sortNotificationsDesc(items []models.Notification) {
	for i := 0; i < len(items); i++ {
		for j := i + 1; j < len(items); j++ {
			if items[j].CreatedAt.After(items[i].CreatedAt) {
				items[i], items[j] = items[j], items[i]
			}
		}
	}
}
