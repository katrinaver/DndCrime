package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"time"

	"github.com/kate/dndcrime/internal/id"
	"github.com/kate/dndcrime/internal/models"
)

const mysqlOperationTimeout = 5 * time.Second

type MySQLStore struct {
	db *sql.DB
}

func NewMySQL(db *sql.DB) *MySQLStore {
	return &MySQLStore{db: db}
}

func EnsureMySQLSchema(ctx context.Context, db *sql.DB) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS profiles (
			user_id VARCHAR(191) PRIMARY KEY,
			email VARCHAR(320) NOT NULL,
			name VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			avatar_url TEXT NOT NULL,
			updated_at DATETIME(6) NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS notes (
			user_id VARCHAR(191) PRIMARY KEY,
			content MEDIUMTEXT NOT NULL,
			updated_at DATETIME(6) NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS campaigns (
			id VARCHAR(32) PRIMARY KEY,
			master_id VARCHAR(191) NOT NULL,
			name VARCHAR(255) NOT NULL,
			data JSON NOT NULL,
			created_at DATETIME(6) NOT NULL,
			updated_at DATETIME(6) NOT NULL,
			INDEX idx_campaigns_master (master_id),
			INDEX idx_campaigns_updated (updated_at)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS campaign_members (
			campaign_id VARCHAR(32) NOT NULL,
			user_id VARCHAR(191) NOT NULL,
			role VARCHAR(32) NOT NULL,
			PRIMARY KEY (campaign_id, user_id),
			INDEX idx_campaign_members_user (user_id),
			CONSTRAINT fk_campaign_members_campaign
				FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
				ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS questionnaires (
			campaign_id VARCHAR(32) PRIMARY KEY,
			data JSON NOT NULL,
			updated_at DATETIME(6) NOT NULL,
			CONSTRAINT fk_questionnaires_campaign
				FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
				ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS characters (
			id VARCHAR(32) PRIMARY KEY,
			owner_id VARCHAR(191) NOT NULL,
			campaign_id VARCHAR(32) NOT NULL,
			data JSON NOT NULL,
			created_at DATETIME(6) NOT NULL,
			updated_at DATETIME(6) NOT NULL,
			INDEX idx_characters_owner (owner_id),
			INDEX idx_characters_campaign (campaign_id),
			INDEX idx_characters_updated (updated_at)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS chats (
			id VARCHAR(32) PRIMARY KEY,
			type VARCHAR(32) NOT NULL,
			campaign_id VARCHAR(32) NOT NULL,
			created_at DATETIME(6) NOT NULL,
			INDEX idx_chats_campaign (campaign_id),
			INDEX idx_chats_type (type)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS chat_messages (
			id VARCHAR(32) PRIMARY KEY,
			chat_id VARCHAR(32) NOT NULL,
			author_id VARCHAR(191) NOT NULL,
			data JSON NOT NULL,
			created_at DATETIME(6) NOT NULL,
			updated_at DATETIME(6) NULL,
			INDEX idx_chat_messages_chat (chat_id, created_at),
			CONSTRAINT fk_chat_messages_chat
				FOREIGN KEY (chat_id) REFERENCES chats(id)
				ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS news_posts (
			id VARCHAR(32) PRIMARY KEY,
			author_id VARCHAR(191) NOT NULL,
			data JSON NOT NULL,
			created_at DATETIME(6) NOT NULL,
			INDEX idx_news_posts_created (created_at)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS calendar_events (
			id VARCHAR(32) PRIMARY KEY,
			campaign_id VARCHAR(32) NOT NULL,
			created_by VARCHAR(191) NOT NULL,
			event_date VARCHAR(10) NOT NULL,
			data JSON NOT NULL,
			created_at DATETIME(6) NOT NULL,
			INDEX idx_calendar_campaign (campaign_id),
			INDEX idx_calendar_date (event_date)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id VARCHAR(32) PRIMARY KEY,
			user_id VARCHAR(191) NOT NULL,
			visible_at DATETIME(6) NOT NULL,
			is_read BOOLEAN NOT NULL,
			created_at DATETIME(6) NOT NULL,
			data JSON NOT NULL,
			INDEX idx_notifications_user_visible (user_id, visible_at),
			INDEX idx_notifications_user_read (user_id, is_read)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`INSERT IGNORE INTO chats (id, type, campaign_id, created_at)
			VALUES ('chat-general', 'general', '', UTC_TIMESTAMP(6))`,
	}

	for _, statement := range statements {
		if _, err := db.ExecContext(ctx, statement); err != nil {
			return err
		}
	}

	return nil
}

func mysqlCtx() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), mysqlOperationTimeout)
}

func logMySQLError(operation string, err error) {
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("mysql store %s: %v", operation, err)
	}
}

func jsonPayload(v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		log.Printf("mysql store marshal json: %v", err)
		return "{}"
	}
	return string(b)
}

func decodePayload[T any](raw []byte) (T, error) {
	var value T
	err := json.Unmarshal(raw, &value)
	return value, err
}

func scanPayload[T any](scanner interface{ Scan(dest ...any) error }) (T, error) {
	var raw []byte
	if err := scanner.Scan(&raw); err != nil {
		var zero T
		return zero, err
	}
	return decodePayload[T](raw)
}

func (s *MySQLStore) GetProfile(userID string) (models.UserProfile, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	var profile models.UserProfile
	err := s.db.QueryRowContext(ctx, `
		SELECT user_id, email, name, description, avatar_url, updated_at
		FROM profiles
		WHERE user_id = ?
	`, userID).Scan(
		&profile.UserID,
		&profile.Email,
		&profile.Name,
		&profile.Description,
		&profile.AvatarURL,
		&profile.UpdatedAt,
	)
	if err != nil {
		logMySQLError("GetProfile", err)
		return models.UserProfile{}, false
	}
	return profile, true
}

func (s *MySQLStore) SaveProfile(profile models.UserProfile) models.UserProfile {
	ctx, cancel := mysqlCtx()
	defer cancel()

	profile.UpdatedAt = Now()
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO profiles (user_id, email, name, description, avatar_url, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			email = VALUES(email),
			name = VALUES(name),
			description = VALUES(description),
			avatar_url = VALUES(avatar_url),
			updated_at = VALUES(updated_at)
	`, profile.UserID, profile.Email, profile.Name, profile.Description, profile.AvatarURL, profile.UpdatedAt)
	logMySQLError("SaveProfile", err)
	return profile
}

func (s *MySQLStore) GetNote(userID string) (models.Note, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	var note models.Note
	err := s.db.QueryRowContext(ctx, `
		SELECT user_id, content, updated_at
		FROM notes
		WHERE user_id = ?
	`, userID).Scan(&note.UserID, &note.Content, &note.UpdatedAt)
	if err != nil {
		logMySQLError("GetNote", err)
		return models.Note{}, false
	}
	return note, true
}

func (s *MySQLStore) SaveNote(note models.Note) models.Note {
	ctx, cancel := mysqlCtx()
	defer cancel()

	note.UpdatedAt = Now()
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO notes (user_id, content, updated_at)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE
			content = VALUES(content),
			updated_at = VALUES(updated_at)
	`, note.UserID, note.Content, note.UpdatedAt)
	logMySQLError("SaveNote", err)
	return note
}

func (s *MySQLStore) ListCampaignsForUser(userID string) []models.Campaign {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT c.data
		FROM campaigns c
		WHERE c.master_id = ?
			OR EXISTS (
				SELECT 1
				FROM campaign_members cm
				WHERE cm.campaign_id = c.id AND cm.user_id = ?
			)
		ORDER BY c.updated_at DESC
	`, userID, userID)
	if err != nil {
		logMySQLError("ListCampaignsForUser", err)
		return []models.Campaign{}
	}
	defer rows.Close()

	campaigns := make([]models.Campaign, 0)
	for rows.Next() {
		campaign, err := scanPayload[models.Campaign](rows)
		if err != nil {
			logMySQLError("ListCampaignsForUser scan", err)
			continue
		}
		campaign.PlayerIDs = s.listCampaignPlayers(ctx, campaign.ID)
		campaign.Players = len(campaign.PlayerIDs)
		campaigns = append(campaigns, campaign)
	}
	logMySQLError("ListCampaignsForUser rows", rows.Err())
	return campaigns
}

func (s *MySQLStore) GetCampaign(campaignID string) (models.Campaign, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	campaign, err := scanPayload[models.Campaign](s.db.QueryRowContext(ctx, `
		SELECT data
		FROM campaigns
		WHERE id = ?
	`, campaignID))
	if err != nil {
		logMySQLError("GetCampaign", err)
		return models.Campaign{}, false
	}
	campaign.PlayerIDs = s.listCampaignPlayers(ctx, campaign.ID)
	campaign.Players = len(campaign.PlayerIDs)
	return campaign, true
}

func (s *MySQLStore) CreateCampaign(campaign models.Campaign, questionnaire models.CharacterQuestionnaire) models.Campaign {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("CreateCampaign begin", err)
		return models.Campaign{}
	}
	defer tx.Rollback()

	now := Now()
	campaign.ID = id.New()
	campaign.CreatedAt = now
	campaign.UpdatedAt = now
	campaign.Players = len(campaign.PlayerIDs)
	if campaign.Status == "" {
		campaign.Status = models.CampaignActive
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO campaigns (id, master_id, name, data, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, campaign.ID, campaign.MasterID, campaign.Name, jsonPayload(campaign), campaign.CreatedAt, campaign.UpdatedAt); err != nil {
		logMySQLError("CreateCampaign campaign", err)
		return models.Campaign{}
	}

	for _, userID := range uniqueIDs(campaign.PlayerIDs) {
		if err := insertCampaignMember(ctx, tx, campaign.ID, userID, "player"); err != nil {
			logMySQLError("CreateCampaign player", err)
			return models.Campaign{}
		}
	}
	if err := insertCampaignMember(ctx, tx, campaign.ID, campaign.MasterID, "master"); err != nil {
		logMySQLError("CreateCampaign master", err)
		return models.Campaign{}
	}

	questionnaire.CampaignID = campaign.ID
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO questionnaires (campaign_id, data, updated_at)
		VALUES (?, ?, ?)
	`, campaign.ID, jsonPayload(questionnaire), now); err != nil {
		logMySQLError("CreateCampaign questionnaire", err)
		return models.Campaign{}
	}

	chat := models.Chat{ID: id.New(), Type: models.ChatTypeCampaign, CampaignID: campaign.ID, CreatedAt: now}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO chats (id, type, campaign_id, created_at)
		VALUES (?, ?, ?, ?)
	`, chat.ID, chat.Type, chat.CampaignID, chat.CreatedAt); err != nil {
		logMySQLError("CreateCampaign chat", err)
		return models.Campaign{}
	}

	if err := tx.Commit(); err != nil {
		logMySQLError("CreateCampaign commit", err)
		return models.Campaign{}
	}
	return campaign
}

func (s *MySQLStore) IsCampaignMember(campaignID, userID string) bool {
	ctx, cancel := mysqlCtx()
	defer cancel()

	var found int
	err := s.db.QueryRowContext(ctx, `
		SELECT 1
		FROM campaigns c
		LEFT JOIN campaign_members cm ON cm.campaign_id = c.id AND cm.user_id = ?
		WHERE c.id = ? AND (c.master_id = ? OR cm.user_id IS NOT NULL)
		LIMIT 1
	`, userID, campaignID, userID).Scan(&found)
	if err != nil {
		logMySQLError("IsCampaignMember", err)
		return false
	}
	return found == 1
}

func (s *MySQLStore) GetQuestionnaire(campaignID string) (models.CharacterQuestionnaire, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	q, err := scanPayload[models.CharacterQuestionnaire](s.db.QueryRowContext(ctx, `
		SELECT data
		FROM questionnaires
		WHERE campaign_id = ?
	`, campaignID))
	if err != nil {
		logMySQLError("GetQuestionnaire", err)
		return models.CharacterQuestionnaire{}, false
	}
	return q, true
}

func (s *MySQLStore) SaveQuestionnaire(q models.CharacterQuestionnaire) models.CharacterQuestionnaire {
	ctx, cancel := mysqlCtx()
	defer cancel()

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO questionnaires (campaign_id, data, updated_at)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE
			data = VALUES(data),
			updated_at = VALUES(updated_at)
	`, q.CampaignID, jsonPayload(q), Now())
	logMySQLError("SaveQuestionnaire", err)
	return q
}

func (s *MySQLStore) ListCharactersByOwner(userID string) []models.Character {
	return s.listCharacters("owner_id = ?", userID)
}

func (s *MySQLStore) ListCharactersByCampaign(campaignID string) []models.Character {
	return s.listCharacters("campaign_id = ?", campaignID)
}

func (s *MySQLStore) listCharacters(where string, args ...any) []models.Character {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT data
		FROM characters
		WHERE `+where+`
		ORDER BY updated_at DESC
	`, args...)
	if err != nil {
		logMySQLError("listCharacters", err)
		return []models.Character{}
	}
	defer rows.Close()

	characters := make([]models.Character, 0)
	for rows.Next() {
		character, err := scanPayload[models.Character](rows)
		if err != nil {
			logMySQLError("listCharacters scan", err)
			continue
		}
		characters = append(characters, character)
	}
	logMySQLError("listCharacters rows", rows.Err())
	return characters
}

func (s *MySQLStore) GetCharacter(characterID string) (models.Character, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	character, err := scanPayload[models.Character](s.db.QueryRowContext(ctx, `
		SELECT data
		FROM characters
		WHERE id = ?
	`, characterID))
	if err != nil {
		logMySQLError("GetCharacter", err)
		return models.Character{}, false
	}
	return character, true
}

func (s *MySQLStore) CreateCharacter(c models.Character) models.Character {
	ctx, cancel := mysqlCtx()
	defer cancel()

	now := Now()
	c.ID = id.New()
	c.CreatedAt = now
	c.UpdatedAt = now
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO characters (id, owner_id, campaign_id, data, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, c.ID, c.OwnerID, c.CampaignID, jsonPayload(c), c.CreatedAt, c.UpdatedAt)
	logMySQLError("CreateCharacter", err)
	return c
}

func (s *MySQLStore) UpdateCharacter(c models.Character) (models.Character, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	existing, found := s.GetCharacter(c.ID)
	if !found || existing.OwnerID != c.OwnerID {
		return models.Character{}, false
	}
	c.CreatedAt = existing.CreatedAt
	c.UpdatedAt = Now()

	res, err := s.db.ExecContext(ctx, `
		UPDATE characters
		SET owner_id = ?, campaign_id = ?, data = ?, updated_at = ?
		WHERE id = ? AND owner_id = ?
	`, c.OwnerID, c.CampaignID, jsonPayload(c), c.UpdatedAt, c.ID, c.OwnerID)
	if err != nil {
		logMySQLError("UpdateCharacter", err)
		return models.Character{}, false
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return models.Character{}, false
	}
	return c, true
}

func (s *MySQLStore) DeleteCharacter(characterID, ownerID string) bool {
	ctx, cancel := mysqlCtx()
	defer cancel()

	res, err := s.db.ExecContext(ctx, `
		DELETE FROM characters
		WHERE id = ? AND owner_id = ?
	`, characterID, ownerID)
	if err != nil {
		logMySQLError("DeleteCharacter", err)
		return false
	}
	affected, _ := res.RowsAffected()
	return affected > 0
}

func (s *MySQLStore) AddCharacterAchievement(characterID, ownerID string, achievement models.AntiAchievement) (models.Character, bool) {
	character, found := s.GetCharacter(characterID)
	if !found || character.OwnerID != ownerID {
		return models.Character{}, false
	}
	achievement.ID = id.New()
	if achievement.EarnedAt.IsZero() {
		achievement.EarnedAt = Now()
	}
	character.AntiAchievements = append(character.AntiAchievements, achievement)
	character.UpdatedAt = Now()

	ctx, cancel := mysqlCtx()
	defer cancel()

	res, err := s.db.ExecContext(ctx, `
		UPDATE characters
		SET data = ?, updated_at = ?
		WHERE id = ? AND owner_id = ?
	`, jsonPayload(character), character.UpdatedAt, characterID, ownerID)
	if err != nil {
		logMySQLError("AddCharacterAchievement", err)
		return models.Character{}, false
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return models.Character{}, false
	}
	return character, true
}

func (s *MySQLStore) GetCampaignChat(campaignID string) (models.Chat, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	chat, err := scanChat(s.db.QueryRowContext(ctx, `
		SELECT id, type, campaign_id, created_at
		FROM chats
		WHERE type = ? AND campaign_id = ?
		LIMIT 1
	`, models.ChatTypeCampaign, campaignID))
	if err != nil {
		logMySQLError("GetCampaignChat", err)
		return models.Chat{}, false
	}
	return chat, true
}

func (s *MySQLStore) GetGeneralChat() (models.Chat, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	chat, err := scanChat(s.db.QueryRowContext(ctx, `
		SELECT id, type, campaign_id, created_at
		FROM chats
		WHERE type = ?
		LIMIT 1
	`, models.ChatTypeGeneral))
	if err != nil {
		logMySQLError("GetGeneralChat", err)
		return models.Chat{}, false
	}
	return chat, true
}

func (s *MySQLStore) ListChatMessages(chatID string) []models.ChatMessage {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT data
		FROM chat_messages
		WHERE chat_id = ?
		ORDER BY created_at ASC
	`, chatID)
	if err != nil {
		logMySQLError("ListChatMessages", err)
		return []models.ChatMessage{}
	}
	defer rows.Close()

	messages := make([]models.ChatMessage, 0)
	for rows.Next() {
		msg, err := scanPayload[models.ChatMessage](rows)
		if err != nil {
			logMySQLError("ListChatMessages scan", err)
			continue
		}
		messages = append(messages, msg)
	}
	logMySQLError("ListChatMessages rows", rows.Err())
	return messages
}

func (s *MySQLStore) GetChatMessage(messageID string) (models.ChatMessage, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	msg, err := scanPayload[models.ChatMessage](s.db.QueryRowContext(ctx, `
		SELECT data
		FROM chat_messages
		WHERE id = ?
	`, messageID))
	if err != nil {
		logMySQLError("GetChatMessage", err)
		return models.ChatMessage{}, false
	}
	return msg, true
}

func (s *MySQLStore) CreateChatMessage(msg models.ChatMessage) models.ChatMessage {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("CreateChatMessage begin", err)
		return models.ChatMessage{}
	}
	defer tx.Rollback()

	msg.ID = id.New()
	msg.CreatedAt = Now()
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO chat_messages (id, chat_id, author_id, data, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, msg.ID, msg.ChatID, msg.AuthorID, jsonPayload(msg), msg.CreatedAt, msg.UpdatedAt); err != nil {
		logMySQLError("CreateChatMessage insert", err)
		return models.ChatMessage{}
	}

	chat, err := getChatTx(ctx, tx, msg.ChatID)
	if err == nil && chat.Type == models.ChatTypeCampaign {
		if err := s.emitCampaignChatNotificationsTx(ctx, tx, chat.CampaignID, msg); err != nil {
			logMySQLError("CreateChatMessage notifications", err)
			return models.ChatMessage{}
		}
	} else {
		logMySQLError("CreateChatMessage chat lookup", err)
	}

	if err := tx.Commit(); err != nil {
		logMySQLError("CreateChatMessage commit", err)
		return models.ChatMessage{}
	}
	return msg
}

func (s *MySQLStore) UpdateChatMessage(messageID, text string) (models.ChatMessage, bool) {
	msg, found := s.GetChatMessage(messageID)
	if !found {
		return models.ChatMessage{}, false
	}
	now := Now()
	msg.Text = text
	msg.UpdatedAt = &now

	ctx, cancel := mysqlCtx()
	defer cancel()

	res, err := s.db.ExecContext(ctx, `
		UPDATE chat_messages
		SET data = ?, updated_at = ?
		WHERE id = ?
	`, jsonPayload(msg), msg.UpdatedAt, messageID)
	if err != nil {
		logMySQLError("UpdateChatMessage", err)
		return models.ChatMessage{}, false
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return models.ChatMessage{}, false
	}
	return msg, true
}

func (s *MySQLStore) DeleteChatMessage(messageID string) bool {
	ctx, cancel := mysqlCtx()
	defer cancel()

	res, err := s.db.ExecContext(ctx, `
		DELETE FROM chat_messages
		WHERE id = ?
	`, messageID)
	if err != nil {
		logMySQLError("DeleteChatMessage", err)
		return false
	}
	affected, _ := res.RowsAffected()
	return affected > 0
}

func (s *MySQLStore) ListNewsPosts() []models.NewsPost {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT data
		FROM news_posts
		ORDER BY created_at DESC
	`)
	if err != nil {
		logMySQLError("ListNewsPosts", err)
		return []models.NewsPost{}
	}
	defer rows.Close()

	posts := make([]models.NewsPost, 0)
	for rows.Next() {
		post, err := scanPayload[models.NewsPost](rows)
		if err != nil {
			logMySQLError("ListNewsPosts scan", err)
			continue
		}
		posts = append(posts, post)
	}
	logMySQLError("ListNewsPosts rows", rows.Err())
	return posts
}

func (s *MySQLStore) GetNewsPost(postID string) (models.NewsPost, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	post, err := scanPayload[models.NewsPost](s.db.QueryRowContext(ctx, `
		SELECT data
		FROM news_posts
		WHERE id = ?
	`, postID))
	if err != nil {
		logMySQLError("GetNewsPost", err)
		return models.NewsPost{}, false
	}
	return post, true
}

func (s *MySQLStore) CreateNewsPost(post models.NewsPost) models.NewsPost {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("CreateNewsPost begin", err)
		return models.NewsPost{}
	}
	defer tx.Rollback()

	post.ID = id.New()
	post.CreatedAt = Now()
	post.Comments = []models.NewsComment{}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO news_posts (id, author_id, data, created_at)
		VALUES (?, ?, ?, ?)
	`, post.ID, post.AuthorID, jsonPayload(post), post.CreatedAt); err != nil {
		logMySQLError("CreateNewsPost insert", err)
		return models.NewsPost{}
	}
	if err := s.emitNewsPostNotificationsTx(ctx, tx, post); err != nil {
		logMySQLError("CreateNewsPost notifications", err)
		return models.NewsPost{}
	}
	if err := tx.Commit(); err != nil {
		logMySQLError("CreateNewsPost commit", err)
		return models.NewsPost{}
	}
	return post
}

func (s *MySQLStore) AddNewsComment(postID string, comment models.NewsComment) (models.NewsPost, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("AddNewsComment begin", err)
		return models.NewsPost{}, false
	}
	defer tx.Rollback()

	post, err := scanPayload[models.NewsPost](tx.QueryRowContext(ctx, `
		SELECT data
		FROM news_posts
		WHERE id = ?
		FOR UPDATE
	`, postID))
	if err != nil {
		logMySQLError("AddNewsComment select", err)
		return models.NewsPost{}, false
	}

	comment.ID = id.New()
	comment.PostID = postID
	comment.CreatedAt = Now()
	post.Comments = append(post.Comments, comment)

	res, err := tx.ExecContext(ctx, `
		UPDATE news_posts
		SET data = ?
		WHERE id = ?
	`, jsonPayload(post), postID)
	if err != nil {
		logMySQLError("AddNewsComment update", err)
		return models.NewsPost{}, false
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return models.NewsPost{}, false
	}
	if err := tx.Commit(); err != nil {
		logMySQLError("AddNewsComment commit", err)
		return models.NewsPost{}, false
	}
	return post, true
}

func (s *MySQLStore) ListCalendarEventsForUser(userID string) []models.CalendarEvent {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT e.data
		FROM calendar_events e
		WHERE e.campaign_id = ''
			OR EXISTS (
				SELECT 1
				FROM campaigns c
				WHERE c.id = e.campaign_id AND c.master_id = ?
			)
			OR EXISTS (
				SELECT 1
				FROM campaign_members cm
				WHERE cm.campaign_id = e.campaign_id AND cm.user_id = ?
			)
		ORDER BY e.event_date ASC, e.created_at ASC
	`, userID, userID)
	if err != nil {
		logMySQLError("ListCalendarEventsForUser", err)
		return []models.CalendarEvent{}
	}
	defer rows.Close()

	events := make([]models.CalendarEvent, 0)
	for rows.Next() {
		event, err := scanPayload[models.CalendarEvent](rows)
		if err != nil {
			logMySQLError("ListCalendarEventsForUser scan", err)
			continue
		}
		events = append(events, event)
	}
	logMySQLError("ListCalendarEventsForUser rows", rows.Err())
	return events
}

func (s *MySQLStore) CreateCalendarEvent(event models.CalendarEvent) models.CalendarEvent {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("CreateCalendarEvent begin", err)
		return models.CalendarEvent{}
	}
	defer tx.Rollback()

	event.ID = id.New()
	event.CreatedAt = Now()
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO calendar_events (id, campaign_id, created_by, event_date, data, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, event.ID, event.CampaignID, event.CreatedBy, event.Date, jsonPayload(event), event.CreatedAt); err != nil {
		logMySQLError("CreateCalendarEvent insert", err)
		return models.CalendarEvent{}
	}
	if event.CampaignID != "" {
		if err := s.emitCalendarReminderNotificationsTx(ctx, tx, event); err != nil {
			logMySQLError("CreateCalendarEvent notifications", err)
			return models.CalendarEvent{}
		}
	}
	if err := tx.Commit(); err != nil {
		logMySQLError("CreateCalendarEvent commit", err)
		return models.CalendarEvent{}
	}
	return event
}

func (s *MySQLStore) ListNotifications(userID string) models.NotificationListResponse {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT data
		FROM notifications
		WHERE user_id = ? AND visible_at <= ?
		ORDER BY created_at DESC
	`, userID, Now())
	if err != nil {
		logMySQLError("ListNotifications", err)
		return models.NotificationListResponse{}
	}
	defer rows.Close()

	items := make([]models.Notification, 0)
	unread := 0
	for rows.Next() {
		n, err := scanPayload[models.Notification](rows)
		if err != nil {
			logMySQLError("ListNotifications scan", err)
			continue
		}
		items = append(items, n)
		if !n.Read {
			unread++
		}
	}
	logMySQLError("ListNotifications rows", rows.Err())
	return models.NotificationListResponse{Items: items, UnreadCount: unread}
}

func (s *MySQLStore) MarkNotificationRead(userID, notificationID string) (models.Notification, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	n, err := scanPayload[models.Notification](s.db.QueryRowContext(ctx, `
		SELECT data
		FROM notifications
		WHERE id = ? AND user_id = ?
	`, notificationID, userID))
	if err != nil {
		logMySQLError("MarkNotificationRead select", err)
		return models.Notification{}, false
	}
	n.Read = true
	res, err := s.db.ExecContext(ctx, `
		UPDATE notifications
		SET is_read = TRUE, data = ?
		WHERE id = ? AND user_id = ?
	`, jsonPayload(n), notificationID, userID)
	if err != nil {
		logMySQLError("MarkNotificationRead update", err)
		return models.Notification{}, false
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return models.Notification{}, false
	}
	return n, true
}

func (s *MySQLStore) MarkAllNotificationsRead(userID string) int {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT data
		FROM notifications
		WHERE user_id = ? AND is_read = FALSE AND visible_at <= ?
	`, userID, Now())
	if err != nil {
		logMySQLError("MarkAllNotificationsRead select", err)
		return 0
	}

	notifications := make([]models.Notification, 0)
	for rows.Next() {
		n, err := scanPayload[models.Notification](rows)
		if err != nil {
			logMySQLError("MarkAllNotificationsRead scan", err)
			continue
		}
		n.Read = true
		notifications = append(notifications, n)
	}
	rows.Close()
	logMySQLError("MarkAllNotificationsRead rows", rows.Err())

	count := 0
	for _, n := range notifications {
		res, err := s.db.ExecContext(ctx, `
			UPDATE notifications
			SET is_read = TRUE, data = ?
			WHERE id = ? AND user_id = ? AND is_read = FALSE
		`, jsonPayload(n), n.ID, userID)
		if err != nil {
			logMySQLError("MarkAllNotificationsRead update", err)
			continue
		}
		affected, _ := res.RowsAffected()
		count += int(affected)
	}
	return count
}

func insertCampaignMember(ctx context.Context, tx *sql.Tx, campaignID, userID, role string) error {
	if userID == "" {
		return nil
	}
	_, err := tx.ExecContext(ctx, `
		INSERT INTO campaign_members (campaign_id, user_id, role)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE role = role
	`, campaignID, userID, role)
	return err
}

func (s *MySQLStore) listCampaignPlayers(ctx context.Context, campaignID string) []string {
	rows, err := s.db.QueryContext(ctx, `
		SELECT user_id
		FROM campaign_members
		WHERE campaign_id = ? AND role = 'player'
		ORDER BY user_id
	`, campaignID)
	if err != nil {
		logMySQLError("listCampaignPlayers", err)
		return []string{}
	}
	defer rows.Close()

	ids := make([]string, 0)
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			logMySQLError("listCampaignPlayers scan", err)
			continue
		}
		ids = append(ids, userID)
	}
	logMySQLError("listCampaignPlayers rows", rows.Err())
	return ids
}

func scanChat(scanner interface{ Scan(dest ...any) error }) (models.Chat, error) {
	var chat models.Chat
	err := scanner.Scan(&chat.ID, &chat.Type, &chat.CampaignID, &chat.CreatedAt)
	return chat, err
}

func getChatTx(ctx context.Context, tx *sql.Tx, chatID string) (models.Chat, error) {
	return scanChat(tx.QueryRowContext(ctx, `
		SELECT id, type, campaign_id, created_at
		FROM chats
		WHERE id = ?
	`, chatID))
}

func getCampaignTx(ctx context.Context, tx *sql.Tx, campaignID string) (models.Campaign, error) {
	return scanPayload[models.Campaign](tx.QueryRowContext(ctx, `
		SELECT data
		FROM campaigns
		WHERE id = ?
	`, campaignID))
}

func campaignMemberIDsTx(ctx context.Context, tx *sql.Tx, campaignID string) ([]string, error) {
	rows, err := tx.QueryContext(ctx, `
		SELECT master_id
		FROM campaigns
		WHERE id = ?
		UNION
		SELECT user_id
		FROM campaign_members
		WHERE campaign_id = ?
	`, campaignID, campaignID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]string, 0)
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		ids = append(ids, userID)
	}
	return uniqueIDs(ids), rows.Err()
}

func allKnownUserIDsTx(ctx context.Context, tx *sql.Tx) ([]string, error) {
	rows, err := tx.QueryContext(ctx, `
		SELECT user_id FROM profiles
		UNION
		SELECT master_id FROM campaigns
		UNION
		SELECT user_id FROM campaign_members
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]string, 0)
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		ids = append(ids, userID)
	}
	return uniqueIDs(ids), rows.Err()
}

func saveNotificationTx(ctx context.Context, tx *sql.Tx, n models.Notification) error {
	now := Now()
	n.ID = id.New()
	n.CreatedAt = now
	if n.VisibleAt.IsZero() {
		n.VisibleAt = now
	}
	_, err := tx.ExecContext(ctx, `
		INSERT INTO notifications (id, user_id, visible_at, is_read, created_at, data)
		VALUES (?, ?, ?, ?, ?, ?)
	`, n.ID, n.UserID, n.VisibleAt, n.Read, n.CreatedAt, jsonPayload(n))
	return err
}

func (s *MySQLStore) emitCampaignChatNotificationsTx(ctx context.Context, tx *sql.Tx, campaignID string, msg models.ChatMessage) error {
	campaign, err := getCampaignTx(ctx, tx, campaignID)
	if err != nil {
		return err
	}
	memberIDs, err := campaignMemberIDsTx(ctx, tx, campaignID)
	if err != nil {
		return err
	}

	for _, userID := range memberIDs {
		if userID == msg.AuthorID {
			continue
		}
		if err := saveNotificationTx(ctx, tx, models.Notification{
			UserID:        userID,
			Type:          models.NotificationCampaignChatMessage,
			Title:         "Новое сообщение в «" + campaign.Name + "»",
			Body:          truncate(msg.Text, 120),
			CampaignID:    campaignID,
			CampaignName:  campaign.Name,
			ChatMessageID: msg.ID,
			AuthorName:    msg.AuthorName,
		}); err != nil {
			return err
		}
	}
	return nil
}

func (s *MySQLStore) emitNewsPostNotificationsTx(ctx context.Context, tx *sql.Tx, post models.NewsPost) error {
	userIDs, err := allKnownUserIDsTx(ctx, tx)
	if err != nil {
		return err
	}

	title := "Новая запись в ленте"
	if post.Campaign != "" {
		title = "Новость: " + post.Campaign
	}
	for _, userID := range userIDs {
		if userID == post.AuthorID {
			continue
		}
		if err := saveNotificationTx(ctx, tx, models.Notification{
			UserID:     userID,
			Type:       models.NotificationNewsPost,
			Title:      title,
			Body:       truncate(post.Content, 160),
			NewsPostID: post.ID,
			AuthorName: post.Author,
		}); err != nil {
			return err
		}
	}
	return nil
}

func (s *MySQLStore) emitCalendarReminderNotificationsTx(ctx context.Context, tx *sql.Tx, event models.CalendarEvent) error {
	campaign, err := getCampaignTx(ctx, tx, event.CampaignID)
	if err != nil {
		return err
	}
	memberIDs, err := campaignMemberIDsTx(ctx, tx, event.CampaignID)
	if err != nil {
		return err
	}

	campaignName := event.Campaign
	if campaignName == "" {
		campaignName = campaign.Name
	}

	body := "Кампания «" + campaignName + "» — " + event.Date
	if event.Time != "" {
		body += " в " + event.Time
	}
	if event.Place != "" {
		body += " · " + event.Place
	}

	for _, userID := range memberIDs {
		if err := saveNotificationTx(ctx, tx, models.Notification{
			UserID:          userID,
			Type:            models.NotificationCalendarReminder,
			Title:           "Завтра сессия: " + campaignName,
			Body:            body,
			CampaignID:      event.CampaignID,
			CampaignName:    campaignName,
			CalendarEventID: event.ID,
			EventDate:       event.Date,
			EventTime:       event.Time,
			VisibleAt:       calendarReminderVisibleAt(event.Date),
		}); err != nil {
			return err
		}
	}
	return nil
}
