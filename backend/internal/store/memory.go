package store

import (
	"sync"
	"time"

	"github.com/kate/dndcrime/internal/id"
	"github.com/kate/dndcrime/internal/models"
)

type MemoryStore struct {
	mu              sync.RWMutex
	profiles        map[string]models.UserProfile
	notes           map[string]models.Note
	campaigns       map[string]models.Campaign
	questionnaires  map[string]models.CharacterQuestionnaire
	campaignAssets  map[string]models.CampaignAsset
	campaignProgress map[string]models.CampaignProgress
	characters      map[string]models.Character
	chats           map[string]models.Chat
	messages        map[string][]models.ChatMessage
	newsPosts       map[string]models.NewsPost
	calendar        map[string]models.CalendarEvent
	notifications   map[string]models.Notification
}

func NewMemory() *MemoryStore {
	s := &MemoryStore{
		profiles:         make(map[string]models.UserProfile),
		notes:            make(map[string]models.Note),
		campaigns:        make(map[string]models.Campaign),
		questionnaires:   make(map[string]models.CharacterQuestionnaire),
		campaignAssets:   make(map[string]models.CampaignAsset),
		campaignProgress: make(map[string]models.CampaignProgress),
		characters:       make(map[string]models.Character),
		chats:            make(map[string]models.Chat),
		messages:         make(map[string][]models.ChatMessage),
		newsPosts:        make(map[string]models.NewsPost),
		calendar:         make(map[string]models.CalendarEvent),
		notifications:    make(map[string]models.Notification),
	}
	s.seed()
	return s
}

func (s *MemoryStore) seed() {
	now := Now()
	master1 := "master-1"
	master2 := "master-2"

	campaign1 := models.Campaign{
		ID: "1", Name: "Проклятие Страда", MasterID: master1, MasterName: "Алексей",
		PlayerIDs: []string{"user-demo"}, Players: 5, Place: "Discord",
		Setting: "Готика, хоррор и политика Баровии", MaxPlayers: 6, Level: "1",
		AntiAchievementPool: []string{
			"Попытался убедить дракона пожертвовать сокровища",
			"Забыл, зачем пришли в подземелье",
		},
		LastSession: "28.06.2026", Status: models.CampaignActive, CreatedAt: now, UpdatedAt: now,
	}

	campaign2 := models.Campaign{
		ID: "2", Name: "Таверна у Красного Дракона", MasterID: master2, MasterName: "Мария",
		PlayerIDs: []string{"user-demo"}, Players: 4, Place: "Zoom",
		Setting: "Городское приключение с интригами", MaxPlayers: 6, Level: "1",
		AntiAchievementPool: []string{"Уронил факел в собственный инвентарь"},
		LastSession: "15.06.2026", Status: models.CampaignPaused, CreatedAt: now, UpdatedAt: now,
	}

	s.campaigns["1"] = campaign1
	s.campaigns["2"] = campaign2

	s.campaignAssets["asset-1"] = models.CampaignAsset{
		ID: "asset-1", CampaignID: "1", Title: "Карта Баровии",
		Type: models.AssetTypeMap, Description: "Обзорная карта региона",
		CreatedAt: now, UpdatedAt: now,
	}

	s.campaignProgress["1"] = models.CampaignProgress{
		CampaignID: "1", Summary: "Группа прибыла в деревню Баровия и встретила Страда.",
		CurrentChapter: "Глава 1: Прибытие",
		Milestones: []models.CampaignMilestone{
			{ID: "ms-1", Title: "Прибытие в Баровию", Description: "Добраться до деревни", Completed: true, CompletedAt: &now, Order: 1},
			{ID: "ms-2", Title: "Встреча со Страдом", Description: "Первая аудиенция у властителя", Completed: false, Order: 2},
		},
		UpdatedAt: now,
	}

	s.questionnaires["1"] = models.CharacterQuestionnaire{
		CampaignID: "1", Title: "Анкета: Проклятие Страда",
		Description: "Готика, хоррор и политика Баровии.",
		Fields: []models.QuestionnaireField{
			{ID: "connection", Label: "Связь с Баровией", Type: models.FieldTextarea},
			{ID: "fear", Label: "Главный страх", Type: models.FieldText},
		},
	}

	char1 := models.Character{
		ID: "1", OwnerID: "user-demo", Name: "Эларион Сумрачный", ClassName: "Волшебник", Level: 5,
		Species: "Высший эльф", Background: "Мудрец", PlayerName: "Мария", Alignment: "Нейтральный добрый",
		ExperiencePoints: 6500,
		Abilities: models.AbilityScores{Strength: 8, Dexterity: 14, Constitution: 12, Intelligence: 18, Wisdom: 13, Charisma: 10},
		ArmorClass: 13, Initiative: 2, Speed: 30, MaxHP: 32, CurrentHP: 28, HitDice: "5d6", ProficiencyBonus: 3,
		SavingThrows: []string{"Интеллект", "Мудрость"}, Skills: []string{"Магия", "История"},
		PersonalityTraits: "Говорит цитатами из древних трактатов.",
		CreationType: models.CreationClassic, CampaignID: "1", CampaignName: campaign1.Name,
		AntiAchievements: []models.AntiAchievement{{
			ID: "aa1", Title: "Попытался убедить дракона пожертвовать сокровища", EarnedAt: now,
		}},
		CreatedAt: now, UpdatedAt: now,
	}
	s.characters["1"] = char1

	campaignChat1 := models.Chat{ID: "chat-campaign-1", Type: models.ChatTypeCampaign, CampaignID: "1", CreatedAt: now}
	generalChat := models.Chat{ID: "chat-general", Type: models.ChatTypeGeneral, CreatedAt: now}
	s.chats[campaignChat1.ID] = campaignChat1
	s.chats[generalChat.ID] = generalChat

	s.messages[campaignChat1.ID] = []models.ChatMessage{
		{ID: id.New(), ChatID: campaignChat1.ID, AuthorID: master1, AuthorName: "Алексей", Text: "Сессия в субботу в 19:00", CreatedAt: now},
	}
	s.messages[generalChat.ID] = []models.ChatMessage{
		{ID: id.New(), ChatID: generalChat.ID, AuthorID: "user-a", AuthorName: "Мария", Text: "Кто играет в субботу?", CreatedAt: now},
	}

	post := models.NewsPost{
		ID: id.New(), AuthorID: master1, Author: "Алексей",
		Content: "Следующая сессия «Проклятие Страда» — перенос на воскресенье.",
		Campaign: campaign1.Name, CreatedAt: now, Comments: []models.NewsComment{},
	}
	s.newsPosts[post.ID] = post

	s.calendar["ev1"] = models.CalendarEvent{
		ID: "ev1", Date: "2026-07-05", Title: "Сессия #12", CampaignID: "1", Campaign: campaign1.Name, CreatedAt: now,
	}

	s.notifications["seed1"] = models.Notification{
		ID: "seed1", UserID: "user-demo", Type: models.NotificationCalendarReminder,
		Title: "Завтра сессия: Проклятие Страда",
		Body:  "Кампания «Проклятие Страда» — 2026-07-05",
		CampaignID: "1", CampaignName: campaign1.Name, CalendarEventID: "ev1",
		EventDate: "2026-07-05", VisibleAt: now.Add(-time.Hour), CreatedAt: now,
	}
}

func (s *MemoryStore) GetProfile(userID string) (models.UserProfile, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.profiles[userID]
	return p, ok
}

func (s *MemoryStore) SaveProfile(profile models.UserProfile) models.UserProfile {
	s.mu.Lock()
	defer s.mu.Unlock()
	profile.UpdatedAt = Now()
	s.profiles[profile.UserID] = profile
	return profile
}

func (s *MemoryStore) GetNote(userID string) (models.Note, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	n, ok := s.notes[userID]
	return n, ok
}

func (s *MemoryStore) SaveNote(note models.Note) models.Note {
	s.mu.Lock()
	defer s.mu.Unlock()
	note.UpdatedAt = Now()
	s.notes[note.UserID] = note
	return note
}

func (s *MemoryStore) ListCampaignsForUser(userID string) []models.Campaign {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Campaign, 0)
	for _, c := range s.campaigns {
		if c.MasterID == userID || contains(c.PlayerIDs, userID) {
			out = append(out, c)
		}
	}
	return out
}

func (s *MemoryStore) GetCampaign(id string) (models.Campaign, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	c, ok := s.campaigns[id]
	return c, ok
}

func (s *MemoryStore) CreateCampaign(campaign models.Campaign, questionnaire models.CharacterQuestionnaire) models.Campaign {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := Now()
	campaign.ID = id.New()
	campaign.CreatedAt = now
	campaign.UpdatedAt = now
	campaign.Players = len(campaign.PlayerIDs)
	if campaign.Status == "" {
		campaign.Status = models.CampaignActive
	}
	s.campaigns[campaign.ID] = campaign

	questionnaire.CampaignID = campaign.ID
	s.questionnaires[campaign.ID] = questionnaire

	chat := models.Chat{ID: id.New(), Type: models.ChatTypeCampaign, CampaignID: campaign.ID, CreatedAt: now}
	s.chats[chat.ID] = chat
	s.messages[chat.ID] = []models.ChatMessage{}

	return campaign
}

func (s *MemoryStore) UpdateCampaign(campaignID string, update models.UpdateCampaignRequest) (models.Campaign, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	campaign, ok := s.campaigns[campaignID]
	if !ok {
		return models.Campaign{}, false
	}

	if update.Name != "" {
		campaign.Name = update.Name
	}
	campaign.Place = update.Place
	campaign.Setting = update.Setting
	if update.MaxPlayers > 0 {
		campaign.MaxPlayers = update.MaxPlayers
	}
	if update.Level != "" {
		campaign.Level = update.Level
	}
	campaign.ExtraParams = update.ExtraParams
	if update.AntiAchievementPool != nil {
		campaign.AntiAchievementPool = update.AntiAchievementPool
	}
	campaign.SessionDate = update.SessionDate
	campaign.SessionTime = update.SessionTime
	campaign.LastSession = update.LastSession
	if update.Status != "" {
		campaign.Status = update.Status
	}
	campaign.UpdatedAt = Now()
	s.campaigns[campaignID] = campaign
	return campaign, true
}

func (s *MemoryStore) IsCampaignMaster(campaignID, userID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	c, ok := s.campaigns[campaignID]
	if !ok {
		return false
	}
	return c.MasterID == userID
}

func (s *MemoryStore) ListCampaignAssets(campaignID string) []models.CampaignAsset {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.CampaignAsset, 0)
	for _, asset := range s.campaignAssets {
		if asset.CampaignID == campaignID {
			out = append(out, asset)
		}
	}
	return out
}

func (s *MemoryStore) CreateCampaignAsset(campaignID string, asset models.CampaignAsset) models.CampaignAsset {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := Now()
	asset.ID = id.New()
	asset.CampaignID = campaignID
	asset.CreatedAt = now
	asset.UpdatedAt = now
	if asset.Type == "" {
		asset.Type = models.AssetTypeNote
	}
	s.campaignAssets[asset.ID] = asset
	return asset
}

func (s *MemoryStore) UpdateCampaignAsset(campaignID, assetID string, asset models.CampaignAsset) (models.CampaignAsset, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	existing, ok := s.campaignAssets[assetID]
	if !ok || existing.CampaignID != campaignID {
		return models.CampaignAsset{}, false
	}
	existing.Title = asset.Title
	if asset.Type != "" {
		existing.Type = asset.Type
	}
	existing.Description = asset.Description
	existing.URL = asset.URL
	existing.UpdatedAt = Now()
	s.campaignAssets[assetID] = existing
	return existing, true
}

func (s *MemoryStore) DeleteCampaignAsset(campaignID, assetID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	existing, ok := s.campaignAssets[assetID]
	if !ok || existing.CampaignID != campaignID {
		return false
	}
	delete(s.campaignAssets, assetID)
	return true
}

func (s *MemoryStore) GetCampaignProgress(campaignID string) (models.CampaignProgress, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	progress, ok := s.campaignProgress[campaignID]
	if !ok {
		return models.CampaignProgress{
			CampaignID: campaignID,
			Milestones: []models.CampaignMilestone{},
			UpdatedAt:  Now(),
		}, false
	}
	return progress, true
}

func (s *MemoryStore) SaveCampaignProgress(progress models.CampaignProgress) models.CampaignProgress {
	s.mu.Lock()
	defer s.mu.Unlock()
	progress.UpdatedAt = Now()
	if progress.Milestones == nil {
		progress.Milestones = []models.CampaignMilestone{}
	}
	s.campaignProgress[progress.CampaignID] = progress
	return progress
}

func (s *MemoryStore) IsCampaignMember(campaignID, userID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	c, ok := s.campaigns[campaignID]
	if !ok {
		return false
	}
	return c.MasterID == userID || contains(c.PlayerIDs, userID)
}

func (s *MemoryStore) GetQuestionnaire(campaignID string) (models.CharacterQuestionnaire, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	q, ok := s.questionnaires[campaignID]
	return q, ok
}

func (s *MemoryStore) SaveQuestionnaire(q models.CharacterQuestionnaire) models.CharacterQuestionnaire {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.questionnaires[q.CampaignID] = q
	return q
}

func (s *MemoryStore) ListCharactersByOwner(userID string) []models.Character {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Character, 0)
	for _, c := range s.characters {
		if c.OwnerID == userID {
			out = append(out, c)
		}
	}
	return out
}

func (s *MemoryStore) ListCharactersByCampaign(campaignID string) []models.Character {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Character, 0)
	for _, c := range s.characters {
		if c.CampaignID == campaignID {
			out = append(out, c)
		}
	}
	return out
}

func (s *MemoryStore) GetCharacter(id string) (models.Character, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	c, ok := s.characters[id]
	return c, ok
}

func (s *MemoryStore) CreateCharacter(c models.Character) models.Character {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := Now()
	c.ID = id.New()
	c.CreatedAt = now
	c.UpdatedAt = now
	s.characters[c.ID] = c
	return c
}

func (s *MemoryStore) UpdateCharacter(c models.Character) (models.Character, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	existing, ok := s.characters[c.ID]
	if !ok || existing.OwnerID != c.OwnerID {
		return models.Character{}, false
	}
	c.CreatedAt = existing.CreatedAt
	c.UpdatedAt = Now()
	s.characters[c.ID] = c
	return c, true
}

func (s *MemoryStore) DeleteCharacter(id, ownerID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	c, ok := s.characters[id]
	if !ok || c.OwnerID != ownerID {
		return false
	}
	delete(s.characters, id)
	return true
}

func (s *MemoryStore) AddCharacterAchievement(characterID, ownerID string, achievement models.AntiAchievement) (models.Character, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	c, ok := s.characters[characterID]
	if !ok || c.OwnerID != ownerID {
		return models.Character{}, false
	}
	achievement.ID = id.New()
	if achievement.EarnedAt.IsZero() {
		achievement.EarnedAt = Now()
	}
	c.AntiAchievements = append(c.AntiAchievements, achievement)
	c.UpdatedAt = Now()
	s.characters[characterID] = c
	return c, true
}

func (s *MemoryStore) GetCampaignChat(campaignID string) (models.Chat, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, chat := range s.chats {
		if chat.Type == models.ChatTypeCampaign && chat.CampaignID == campaignID {
			return chat, true
		}
	}
	return models.Chat{}, false
}

func (s *MemoryStore) GetGeneralChat() (models.Chat, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, chat := range s.chats {
		if chat.Type == models.ChatTypeGeneral {
			return chat, true
		}
	}
	return models.Chat{}, false
}

func (s *MemoryStore) ListChatMessages(chatID string) []models.ChatMessage {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]models.ChatMessage(nil), s.messages[chatID]...)
}

func (s *MemoryStore) CreateChatMessage(msg models.ChatMessage) models.ChatMessage {
	s.mu.Lock()
	defer s.mu.Unlock()
	msg.ID = id.New()
	msg.CreatedAt = Now()
	s.messages[msg.ChatID] = append(s.messages[msg.ChatID], msg)

	if chat, ok := s.chats[msg.ChatID]; ok && chat.Type == models.ChatTypeCampaign {
		s.emitCampaignChatNotificationsLocked(chat.CampaignID, msg)
	}

	return msg
}

func (s *MemoryStore) GetChatMessage(messageID string) (models.ChatMessage, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, msgs := range s.messages {
		for _, msg := range msgs {
			if msg.ID == messageID {
				return msg, true
			}
		}
	}
	return models.ChatMessage{}, false
}

func (s *MemoryStore) UpdateChatMessage(messageID, text string) (models.ChatMessage, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for chatID, msgs := range s.messages {
		for i, msg := range msgs {
			if msg.ID != messageID {
				continue
			}
			now := Now()
			msg.Text = text
			msg.UpdatedAt = &now
			s.messages[chatID][i] = msg
			return msg, true
		}
	}
	return models.ChatMessage{}, false
}

func (s *MemoryStore) DeleteChatMessage(messageID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	for chatID, msgs := range s.messages {
		for i, msg := range msgs {
			if msg.ID != messageID {
				continue
			}
			s.messages[chatID] = append(msgs[:i], msgs[i+1:]...)
			return true
		}
	}
	return false
}

func (s *MemoryStore) ListNewsPosts() []models.NewsPost {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.NewsPost, 0, len(s.newsPosts))
	for _, p := range s.newsPosts {
		out = append(out, p)
	}
	return out
}

func (s *MemoryStore) GetNewsPost(id string) (models.NewsPost, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.newsPosts[id]
	return p, ok
}

func (s *MemoryStore) CreateNewsPost(post models.NewsPost) models.NewsPost {
	s.mu.Lock()
	defer s.mu.Unlock()
	post.ID = id.New()
	post.CreatedAt = Now()
	post.Comments = []models.NewsComment{}
	s.newsPosts[post.ID] = post
	s.emitNewsPostNotificationsLocked(post)
	return post
}

func (s *MemoryStore) AddNewsComment(postID string, comment models.NewsComment) (models.NewsPost, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	post, ok := s.newsPosts[postID]
	if !ok {
		return models.NewsPost{}, false
	}
	comment.ID = id.New()
	comment.PostID = postID
	comment.CreatedAt = Now()
	post.Comments = append(post.Comments, comment)
	s.newsPosts[postID] = post
	return post, true
}

func (s *MemoryStore) ListCalendarEventsForUser(userID string) []models.CalendarEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.CalendarEvent, 0)
	for _, ev := range s.calendar {
		if ev.CampaignID == "" {
			out = append(out, ev)
			continue
		}
		if s.isCampaignMemberLocked(campaignIDFromEvent(ev), userID) {
			out = append(out, ev)
		}
	}
	return out
}

func (s *MemoryStore) CreateCalendarEvent(event models.CalendarEvent) models.CalendarEvent {
	s.mu.Lock()
	defer s.mu.Unlock()
	event.ID = id.New()
	event.CreatedAt = Now()
	s.calendar[event.ID] = event
	if event.CampaignID != "" {
		s.emitCalendarReminderNotificationsLocked(event)
	}
	return event
}

func (s *MemoryStore) isCampaignMemberLocked(campaignID, userID string) bool {
	if campaignID == "" {
		return true
	}
	c, ok := s.campaigns[campaignID]
	if !ok {
		return false
	}
	return c.MasterID == userID || contains(c.PlayerIDs, userID)
}

func campaignIDFromEvent(ev models.CalendarEvent) string {
	return ev.CampaignID
}

func contains(list []string, v string) bool {
	for _, item := range list {
		if item == v {
			return true
		}
	}
	return false
}
