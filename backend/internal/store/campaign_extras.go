package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/kate/dndcrime/internal/id"
	"github.com/kate/dndcrime/internal/models"
)

// progressRowQueryer покрывает и *sql.DB, и *sql.Tx — чтобы загрузку прогресса
// можно было выполнять как обычным чтением, так и внутри транзакции с FOR UPDATE.
type progressRowQueryer interface {
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

// loadCampaignProgress читает прогресс кампании, СТРОГО различая «строки ещё нет»
// (sql.ErrNoRows → found=false, err=nil) и реальную ошибку БД (err!=nil). Это не
// даёт транзиентной ошибке чтения превратиться в «заметок нет» и затереть данные.
func loadCampaignProgress(ctx context.Context, q progressRowQueryer, campaignID string, forUpdate bool) (models.CampaignProgress, bool, error) {
	query := `SELECT data, updated_at FROM campaign_progress WHERE campaign_id = ?`
	if forUpdate {
		query += ` FOR UPDATE`
	}

	var raw []byte
	var updatedAt sql.NullTime
	err := q.QueryRowContext(ctx, query, campaignID).Scan(&raw, &updatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return models.CampaignProgress{
			CampaignID: campaignID,
			Notes:      []models.CampaignProgressNote{},
			UpdatedAt:  Now(),
		}, false, nil
	}
	if err != nil {
		return models.CampaignProgress{}, false, err
	}

	progress, err := decodePayload[models.CampaignProgress](raw)
	if err != nil {
		return models.CampaignProgress{}, false, err
	}
	if updatedAt.Valid {
		progress.UpdatedAt = updatedAt.Time
	}
	progress.CampaignID = campaignID
	if progress.Notes == nil {
		progress.Notes = []models.CampaignProgressNote{}
	}
	return progress, true, nil
}

func (s *MySQLStore) UpdateCampaign(campaignID string, update models.UpdateCampaignRequest) (models.Campaign, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("UpdateCampaign begin", err)
		return models.Campaign{}, false
	}
	defer tx.Rollback()

	// FOR UPDATE + запись в одной транзакции: иначе конкурентный
	// PublishCampaignInvitation/JoinCampaign может быть затёрт (InvitationPostID/
	// Status живут только в JSON campaigns.data).
	campaign, err := getCampaignForUpdateTx(ctx, tx, campaignID)
	if err != nil {
		logMySQLError("UpdateCampaign get", err)
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

	if _, err := tx.ExecContext(ctx, `
		UPDATE campaigns
		SET name = ?, data = ?, updated_at = ?
		WHERE id = ?
	`, campaign.Name, jsonPayload(campaign), campaign.UpdatedAt, campaignID); err != nil {
		logMySQLError("UpdateCampaign", err)
		return models.Campaign{}, false
	}

	if err := tx.Commit(); err != nil {
		logMySQLError("UpdateCampaign commit", err)
		return models.Campaign{}, false
	}

	campaign.PlayerIDs = s.listCampaignPlayers(ctx, campaign.ID)
	campaign.Players = len(campaign.PlayerIDs)
	return campaign, true
}

func (s *MySQLStore) IsCampaignMaster(campaignID, userID string) (bool, error) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	var masterID string
	err := s.db.QueryRowContext(ctx, `
		SELECT master_id FROM campaigns WHERE id = ?
	`, campaignID).Scan(&masterID)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		logMySQLError("IsCampaignMaster", err)
		return false, err
	}
	return masterID == userID, nil
}

func (s *MySQLStore) ListCampaignAssets(campaignID string) []models.CampaignAsset {
	ctx, cancel := mysqlCtx()
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT data, created_at, updated_at
		FROM campaign_assets
		WHERE campaign_id = ?
		ORDER BY created_at ASC
	`, campaignID)
	if err != nil {
		logMySQLError("ListCampaignAssets", err)
		return []models.CampaignAsset{}
	}
	defer rows.Close()

	out := make([]models.CampaignAsset, 0)
	for rows.Next() {
		var raw []byte
		var createdAt, updatedAt sql.NullTime
		if err := rows.Scan(&raw, &createdAt, &updatedAt); err != nil {
			continue
		}
		asset, err := decodePayload[models.CampaignAsset](raw)
		if err != nil {
			continue
		}
		if createdAt.Valid {
			asset.CreatedAt = createdAt.Time
		}
		if updatedAt.Valid {
			asset.UpdatedAt = updatedAt.Time
		}
		out = append(out, asset)
	}
	return out
}

func (s *MySQLStore) CreateCampaignAsset(campaignID string, asset models.CampaignAsset) models.CampaignAsset {
	ctx, cancel := mysqlCtx()
	defer cancel()

	now := Now()
	asset.ID = id.New()
	asset.CampaignID = campaignID
	asset.CreatedAt = now
	asset.UpdatedAt = now
	if asset.Type == "" {
		asset.Type = models.AssetTypeNote
	}

	if _, err := s.db.ExecContext(ctx, `
		INSERT INTO campaign_assets (id, campaign_id, data, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
	`, asset.ID, campaignID, jsonPayload(asset), asset.CreatedAt, asset.UpdatedAt); err != nil {
		logMySQLError("CreateCampaignAsset", err)
	}
	return asset
}

func (s *MySQLStore) UpdateCampaignAsset(campaignID, assetID string, asset models.CampaignAsset) (models.CampaignAsset, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	var raw []byte
	var createdAt sql.NullTime
	err := s.db.QueryRowContext(ctx, `
		SELECT data, created_at
		FROM campaign_assets
		WHERE id = ? AND campaign_id = ?
	`, assetID, campaignID).Scan(&raw, &createdAt)
	if err != nil {
		logMySQLError("UpdateCampaignAsset get", err)
		return models.CampaignAsset{}, false
	}

	existing, err := decodePayload[models.CampaignAsset](raw)
	if err != nil {
		return models.CampaignAsset{}, false
	}

	existing.Title = asset.Title
	if asset.Type != "" {
		existing.Type = asset.Type
	}
	existing.Description = asset.Description
	existing.URL = asset.URL
	existing.UpdatedAt = Now()

	if _, err := s.db.ExecContext(ctx, `
		UPDATE campaign_assets
		SET data = ?, updated_at = ?
		WHERE id = ? AND campaign_id = ?
	`, jsonPayload(existing), existing.UpdatedAt, assetID, campaignID); err != nil {
		logMySQLError("UpdateCampaignAsset", err)
		return models.CampaignAsset{}, false
	}
	return existing, true
}

func (s *MySQLStore) DeleteCampaignAsset(campaignID, assetID string) bool {
	ctx, cancel := mysqlCtx()
	defer cancel()

	res, err := s.db.ExecContext(ctx, `
		DELETE FROM campaign_assets
		WHERE id = ? AND campaign_id = ?
	`, assetID, campaignID)
	if err != nil {
		logMySQLError("DeleteCampaignAsset", err)
		return false
	}
	n, _ := res.RowsAffected()
	return n > 0
}

func (s *MySQLStore) GetCampaignProgress(campaignID string) (models.CampaignProgress, bool, error) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	progress, found, err := loadCampaignProgress(ctx, s.db, campaignID, false)
	if err != nil {
		logMySQLError("GetCampaignProgress", err)
		return models.CampaignProgress{}, false, err
	}
	return progress, found, nil
}

func (s *MySQLStore) SaveCampaignProgress(progress models.CampaignProgress) (models.CampaignProgress, error) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("SaveCampaignProgress begin", err)
		return models.CampaignProgress{}, err
	}
	defer tx.Rollback()

	existing, _, err := loadCampaignProgress(ctx, tx, progress.CampaignID, true)
	if err != nil {
		logMySQLError("SaveCampaignProgress load", err)
		return models.CampaignProgress{}, err
	}
	existing.CurrentChapter = progress.CurrentChapter
	existing.UpdatedAt = Now()
	if existing.Notes == nil {
		existing.Notes = []models.CampaignProgressNote{}
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO campaign_progress (campaign_id, data, updated_at)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)
	`, existing.CampaignID, jsonPayload(existing), existing.UpdatedAt); err != nil {
		logMySQLError("SaveCampaignProgress", err)
		return models.CampaignProgress{}, err
	}
	if err := tx.Commit(); err != nil {
		logMySQLError("SaveCampaignProgress commit", err)
		return models.CampaignProgress{}, err
	}
	return existing, nil
}

func (s *MySQLStore) CreateCampaignProgressNote(campaignID string, note models.CampaignProgressNote) (models.CampaignProgress, error) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("CreateCampaignProgressNote begin", err)
		return models.CampaignProgress{}, err
	}
	defer tx.Rollback()

	progress, _, err := loadCampaignProgress(ctx, tx, campaignID, true)
	if err != nil {
		logMySQLError("CreateCampaignProgressNote load", err)
		return models.CampaignProgress{}, err
	}
	if note.ID == "" {
		note.ID = id.New()
	}
	if note.CreatedAt.IsZero() {
		note.CreatedAt = Now()
	}
	progress.Notes = append([]models.CampaignProgressNote{note}, progress.Notes...)
	progress.UpdatedAt = Now()

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO campaign_progress (campaign_id, data, updated_at)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)
	`, progress.CampaignID, jsonPayload(progress), progress.UpdatedAt); err != nil {
		logMySQLError("CreateCampaignProgressNote", err)
		return models.CampaignProgress{}, err
	}
	if err := tx.Commit(); err != nil {
		logMySQLError("CreateCampaignProgressNote commit", err)
		return models.CampaignProgress{}, err
	}
	return progress, nil
}

func (s *MySQLStore) DeleteCampaignProgressNote(campaignID, noteID string) (models.CampaignProgress, error) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("DeleteCampaignProgressNote begin", err)
		return models.CampaignProgress{}, err
	}
	defer tx.Rollback()

	progress, found, err := loadCampaignProgress(ctx, tx, campaignID, true)
	if err != nil {
		logMySQLError("DeleteCampaignProgressNote load", err)
		return models.CampaignProgress{}, err
	}
	if !found {
		return models.CampaignProgress{}, ErrCampaignNotFound
	}

	next := make([]models.CampaignProgressNote, 0, len(progress.Notes))
	foundNote := false
	for _, note := range progress.Notes {
		if note.ID == noteID {
			foundNote = true
			continue
		}
		next = append(next, note)
	}
	if !foundNote {
		return models.CampaignProgress{}, errors.New("note not found")
	}
	progress.Notes = next
	progress.UpdatedAt = Now()

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO campaign_progress (campaign_id, data, updated_at)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)
	`, progress.CampaignID, jsonPayload(progress), progress.UpdatedAt); err != nil {
		logMySQLError("DeleteCampaignProgressNote", err)
		return models.CampaignProgress{}, err
	}
	if err := tx.Commit(); err != nil {
		logMySQLError("DeleteCampaignProgressNote commit", err)
		return models.CampaignProgress{}, err
	}
	return progress, nil
}

func (s *MySQLStore) JoinCampaign(campaignID, userID string) (models.Campaign, error) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("JoinCampaign begin", err)
		return models.Campaign{}, ErrCampaignNotFound
	}
	defer tx.Rollback()

	campaign, err := getCampaignForUpdateTx(ctx, tx, campaignID)
	if err != nil {
		return models.Campaign{}, ErrCampaignNotFound
	}
	playerIDs, err := campaignMemberIDsTx(ctx, tx, campaignID)
	if err != nil {
		return models.Campaign{}, ErrCampaignNotFound
	}
	campaign.PlayerIDs = playerIDs
	campaign.Players = len(playerIDs)

	if campaign.Status != models.CampaignActive {
		return models.Campaign{}, ErrCampaignNotActive
	}
	if campaign.MasterID == userID || contains(playerIDs, userID) {
		return campaign, ErrAlreadyMember
	}
	if len(playerIDs) >= campaign.MaxPlayers {
		return models.Campaign{}, ErrCampaignFull
	}

	if err := insertCampaignMember(ctx, tx, campaignID, userID, "player"); err != nil {
		logMySQLError("JoinCampaign member", err)
		return models.Campaign{}, ErrCampaignNotFound
	}

	campaign.PlayerIDs = append(campaign.PlayerIDs, userID)
	campaign.Players = len(campaign.PlayerIDs)
	campaign.UpdatedAt = Now()

	if _, err := tx.ExecContext(ctx, `
		UPDATE campaigns
		SET data = ?, updated_at = ?
		WHERE id = ?
	`, jsonPayload(campaign), campaign.UpdatedAt, campaignID); err != nil {
		logMySQLError("JoinCampaign update", err)
		return models.Campaign{}, ErrCampaignNotFound
	}

	if err := saveNotificationTx(ctx, tx, models.Notification{
		UserID:       userID,
		Type:         models.NotificationCampaignJoined,
		Title:        "Вы добавлены в кампанию",
		Body:         fmt.Sprintf("Кампания «%s» появилась в вашем списке", campaign.Name),
		CampaignID:   campaign.ID,
		CampaignName: campaign.Name,
	}); err != nil {
		logMySQLError("JoinCampaign notification", err)
		return models.Campaign{}, ErrCampaignNotFound
	}

	if err := tx.Commit(); err != nil {
		logMySQLError("JoinCampaign commit", err)
		return models.Campaign{}, ErrCampaignNotFound
	}
	return campaign, nil
}

func (s *MySQLStore) PublishCampaignInvitation(campaignID, authorID, authorName string) (models.NewsPost, models.Campaign, error) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("PublishCampaignInvitation begin", err)
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}
	defer tx.Rollback()

	campaign, err := getCampaignForUpdateTx(ctx, tx, campaignID)
	if err != nil {
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}
	if campaign.MasterID != authorID {
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}

	playerIDs, err := campaignMemberIDsTx(ctx, tx, campaignID)
	if err != nil {
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}
	campaign.PlayerIDs = playerIDs
	campaign.Players = len(playerIDs)

	if campaign.InvitationPostID != "" {
		post, err := scanPayload[models.NewsPost](tx.QueryRowContext(ctx, `
			SELECT data
			FROM news_posts
			WHERE id = ?
		`, campaign.InvitationPostID))
		if err == nil {
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

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO news_posts (id, author_id, data, created_at)
		VALUES (?, ?, ?, ?)
	`, post.ID, post.AuthorID, jsonPayload(post), post.CreatedAt); err != nil {
		logMySQLError("PublishCampaignInvitation insert", err)
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}

	campaign.InvitationPostID = post.ID
	campaign.UpdatedAt = now
	if _, err := tx.ExecContext(ctx, `
		UPDATE campaigns
		SET data = ?, updated_at = ?
		WHERE id = ?
	`, jsonPayload(campaign), campaign.UpdatedAt, campaignID); err != nil {
		logMySQLError("PublishCampaignInvitation update campaign", err)
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}

	if err := s.emitNewsPostNotificationsTx(ctx, tx, post); err != nil {
		logMySQLError("PublishCampaignInvitation notifications", err)
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}

	if err := tx.Commit(); err != nil {
		logMySQLError("PublishCampaignInvitation commit", err)
		return models.NewsPost{}, models.Campaign{}, ErrCampaignNotFound
	}
	return post, campaign, nil
}

func (s *MySQLStore) LeaveCampaign(campaignID, userID string) error {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("LeaveCampaign begin", err)
		return ErrCampaignNotFound
	}
	defer tx.Rollback()

	campaign, err := getCampaignTx(ctx, tx, campaignID)
	if err != nil {
		return ErrCampaignNotFound
	}
	if campaign.MasterID == userID {
		return ErrCannotLeaveAsMaster
	}

	playerIDs, err := campaignMemberIDsTx(ctx, tx, campaignID)
	if err != nil {
		return ErrCampaignNotFound
	}
	if !contains(playerIDs, userID) {
		return ErrNotCampaignMember
	}

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM campaign_members
		WHERE campaign_id = ? AND user_id = ? AND role = 'player'
	`, campaignID, userID); err != nil {
		logMySQLError("LeaveCampaign delete member", err)
		return ErrCampaignNotFound
	}

	next := make([]string, 0, len(playerIDs))
	for _, id := range playerIDs {
		if id != userID {
			next = append(next, id)
		}
	}
	campaign.PlayerIDs = next
	campaign.Players = len(next)
	campaign.UpdatedAt = Now()

	if _, err := tx.ExecContext(ctx, `
		UPDATE campaigns
		SET data = ?, updated_at = ?
		WHERE id = ?
	`, jsonPayload(campaign), campaign.UpdatedAt, campaignID); err != nil {
		logMySQLError("LeaveCampaign update", err)
		return ErrCampaignNotFound
	}

	if err := tx.Commit(); err != nil {
		logMySQLError("LeaveCampaign commit", err)
		return ErrCampaignNotFound
	}
	return nil
}

func (s *MySQLStore) DeleteCampaign(campaignID, masterID string) error {
	ctx, cancel := mysqlCtx()
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		logMySQLError("DeleteCampaign begin", err)
		return ErrCampaignNotFound
	}
	defer tx.Rollback()

	// Читаем кампанию, чтобы достать invitation-пост: у news_posts нет FK на
	// campaigns, поэтому каскад его не заденет и его нужно удалить вручную.
	campaign, err := scanPayload[models.Campaign](tx.QueryRowContext(ctx, `
		SELECT data
		FROM campaigns
		WHERE id = ? AND master_id = ?
	`, campaignID, masterID))
	if errors.Is(err, sql.ErrNoRows) {
		return ErrCampaignNotFound
	}
	if err != nil {
		logMySQLError("DeleteCampaign load", err)
		return err
	}

	// Удаление кампании каскадно уберёт campaign_members/questionnaires/
	// campaign_assets/campaign_progress (у них FK ON DELETE CASCADE).
	res, err := tx.ExecContext(ctx, `
		DELETE FROM campaigns
		WHERE id = ? AND master_id = ?
	`, campaignID, masterID)
	if err != nil {
		logMySQLError("DeleteCampaign delete campaign", err)
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrCampaignNotFound
	}

	// Таблицы без FK-каскада на campaigns удаляем явно.
	// chat_messages удалятся каскадом при удалении chats.
	if _, err := tx.ExecContext(ctx, `
		DELETE FROM chats
		WHERE campaign_id = ?
	`, campaignID); err != nil {
		logMySQLError("DeleteCampaign delete chats", err)
		return err
	}

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM characters
		WHERE campaign_id = ?
	`, campaignID); err != nil {
		logMySQLError("DeleteCampaign delete characters", err)
		return err
	}

	if _, err := tx.ExecContext(ctx, `
		DELETE FROM calendar_events
		WHERE campaign_id = ?
	`, campaignID); err != nil {
		logMySQLError("DeleteCampaign delete calendar_events", err)
		return err
	}

	if campaign.InvitationPostID != "" {
		if _, err := tx.ExecContext(ctx, `
			DELETE FROM news_posts
			WHERE id = ?
		`, campaign.InvitationPostID); err != nil {
			logMySQLError("DeleteCampaign delete news_post", err)
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		logMySQLError("DeleteCampaign commit", err)
		return err
	}
	return nil
}
