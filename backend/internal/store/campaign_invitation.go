package store

import (
	"errors"
	"fmt"
	"strings"

	"github.com/kate/dndcrime/internal/id"
	"github.com/kate/dndcrime/internal/models"
)

var (
	ErrCampaignNotFound   = errors.New("campaign not found")
	ErrAlreadyMember      = errors.New("already a campaign member")
	ErrCampaignFull       = errors.New("campaign is full")
	ErrCampaignNotActive  = errors.New("campaign is not accepting players")
	ErrInvitationExists   = errors.New("invitation already published")
	ErrCannotLeaveAsMaster = errors.New("master cannot leave campaign")
	ErrNotCampaignMember  = errors.New("not a campaign member")
)

func buildInvitationContent(campaign models.Campaign) string {
	var parts []string
	parts = append(parts, fmt.Sprintf("<p><strong>Мастер:</strong> %s</p>", escapeHTML(campaign.MasterName)))
	if campaign.Setting != "" {
		parts = append(parts, fmt.Sprintf("<p><strong>Сеттинг:</strong> %s</p>", escapeHTML(campaign.Setting)))
	}
	if campaign.Place != "" {
		parts = append(parts, fmt.Sprintf("<p><strong>Место:</strong> %s</p>", escapeHTML(campaign.Place)))
	}
	parts = append(parts, fmt.Sprintf("<p><strong>Уровень персонажей:</strong> %s</p>", escapeHTML(campaign.Level)))
	parts = append(parts, fmt.Sprintf("<p><strong>Свободных мест:</strong> %d из %d</p>", campaign.MaxPlayers-campaign.Players, campaign.MaxPlayers))
	if campaign.SessionDate != "" {
		session := campaign.SessionDate
		if campaign.SessionTime != "" {
			session += " · " + campaign.SessionTime
		}
		parts = append(parts, fmt.Sprintf("<p><strong>Ближайшая сессия:</strong> %s</p>", escapeHTML(session)))
	}
	if campaign.ExtraParams != "" {
		parts = append(parts, fmt.Sprintf("<p><strong>Дополнительно:</strong> %s</p>", escapeHTML(campaign.ExtraParams)))
	}
	parts = append(parts, "<p>Нажмите «Добавить кампанию», чтобы вступить.</p>")
	return strings.Join(parts, "")
}

func escapeHTML(value string) string {
	replacer := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		"'", "&#39;",
	)
	return replacer.Replace(value)
}

func inviteMetaFromCampaign(campaign models.Campaign) *models.CampaignInviteMeta {
	return &models.CampaignInviteMeta{
		CampaignName: campaign.Name,
		MasterName:   campaign.MasterName,
		Place:        campaign.Place,
		Setting:      campaign.Setting,
		Level:        campaign.Level,
		MaxPlayers:   campaign.MaxPlayers,
		Players:      campaign.Players,
		Status:       campaign.Status,
		SessionDate:  campaign.SessionDate,
		SessionTime:  campaign.SessionTime,
	}
}

func (s *MemoryStore) JoinCampaign(campaignID, userID string) (models.Campaign, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	campaign, ok := s.campaigns[campaignID]
	if !ok {
		return models.Campaign{}, ErrCampaignNotFound
	}
	if campaign.Status != models.CampaignActive {
		return models.Campaign{}, ErrCampaignNotActive
	}
	if campaign.MasterID == userID || contains(campaign.PlayerIDs, userID) {
		return campaign, ErrAlreadyMember
	}
	if len(campaign.PlayerIDs) >= campaign.MaxPlayers {
		return models.Campaign{}, ErrCampaignFull
	}

	campaign.PlayerIDs = append(campaign.PlayerIDs, userID)
	campaign.Players = len(campaign.PlayerIDs)
	campaign.UpdatedAt = Now()
	s.campaigns[campaignID] = campaign

	s.saveNotificationLocked(models.Notification{
		UserID:       userID,
		Type:         models.NotificationCampaignJoined,
		Title:        "Вы добавлены в кампанию",
		Body:         fmt.Sprintf("Кампания «%s» появилась в вашем списке", campaign.Name),
		CampaignID:   campaign.ID,
		CampaignName: campaign.Name,
	})

	return campaign, nil
}

func (s *MemoryStore) LeaveCampaign(campaignID, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	campaign, ok := s.campaigns[campaignID]
	if !ok {
		return ErrCampaignNotFound
	}
	if campaign.MasterID == userID {
		return ErrCannotLeaveAsMaster
	}
	if !contains(campaign.PlayerIDs, userID) {
		return ErrNotCampaignMember
	}

	next := make([]string, 0, len(campaign.PlayerIDs))
	for _, id := range campaign.PlayerIDs {
		if id != userID {
			next = append(next, id)
		}
	}
	campaign.PlayerIDs = next
	campaign.Players = len(next)
	campaign.UpdatedAt = Now()
	s.campaigns[campaignID] = campaign
	return nil
}

func (s *MemoryStore) DeleteCampaign(campaignID, masterID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	campaign, ok := s.campaigns[campaignID]
	if !ok || campaign.MasterID != masterID {
		return ErrCampaignNotFound
	}

	delete(s.campaigns, campaignID)
	delete(s.questionnaires, campaignID)
	delete(s.campaignProgress, campaignID)

	for assetID, asset := range s.campaignAssets {
		if asset.CampaignID == campaignID {
			delete(s.campaignAssets, assetID)
		}
	}

	for chatID, chat := range s.chats {
		if chat.Type == models.ChatTypeCampaign && chat.CampaignID == campaignID {
			delete(s.messages, chatID)
			delete(s.chats, chatID)
		}
	}

	for charID, character := range s.characters {
		if character.CampaignID == campaignID {
			delete(s.characters, charID)
		}
	}

	for eventID, event := range s.calendar {
		if event.CampaignID == campaignID {
			delete(s.calendar, eventID)
		}
	}

	for postID, post := range s.newsPosts {
		if post.CampaignID == campaignID {
			delete(s.newsPosts, postID)
		}
	}

	return nil
}

func (s *MemoryStore) PublishCampaignInvitation(campaignID, authorID, authorName string) (models.NewsPost, models.Campaign, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	campaign, ok := s.campaigns[campaignID]
	if !ok {
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}
	if campaign.MasterID != authorID {
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}
	if campaign.InvitationPostID != "" {
		post, found := s.newsPosts[campaign.InvitationPostID]
		if found {
			return post, campaign, ErrInvitationExists
		}
	}

	now := Now()
	post := models.NewsPost{
		ID:         id.New(),
		AuthorID:   authorID,
		Author:     authorName,
		Content:    buildInvitationContent(campaign),
		Campaign:   campaign.Name,
		CampaignID: campaign.ID,
		Kind:       models.NewsPostKindCampaignInvite,
		InviteMeta: inviteMetaFromCampaign(campaign),
		CreatedAt:  now,
		Comments:   []models.NewsComment{},
	}
	s.newsPosts[post.ID] = post

	campaign.InvitationPostID = post.ID
	campaign.UpdatedAt = now
	s.campaigns[campaignID] = campaign

	s.emitNewsPostNotificationsLocked(post)
	return post, campaign, nil
}
