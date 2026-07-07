package store

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/kate/dndcrime/internal/id"
	"github.com/kate/dndcrime/internal/models"
)

func (s *MySQLStore) UpdateCampaign(campaignID string, update models.UpdateCampaignRequest) (models.Campaign, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	campaign, err := scanPayload[models.Campaign](s.db.QueryRowContext(ctx, `
		SELECT data
		FROM campaigns
		WHERE id = ?
	`, campaignID))
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

	if _, err := s.db.ExecContext(ctx, `
		UPDATE campaigns
		SET name = ?, data = ?, updated_at = ?
		WHERE id = ?
	`, campaign.Name, jsonPayload(campaign), campaign.UpdatedAt, campaignID); err != nil {
		logMySQLError("UpdateCampaign", err)
		return models.Campaign{}, false
	}

	campaign.PlayerIDs = s.listCampaignPlayers(ctx, campaign.ID)
	campaign.Players = len(campaign.PlayerIDs)
	return campaign, true
}

func (s *MySQLStore) IsCampaignMaster(campaignID, userID string) bool {
	ctx, cancel := mysqlCtx()
	defer cancel()

	var masterID string
	err := s.db.QueryRowContext(ctx, `
		SELECT master_id FROM campaigns WHERE id = ?
	`, campaignID).Scan(&masterID)
	return err == nil && masterID == userID
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

func (s *MySQLStore) GetCampaignProgress(campaignID string) (models.CampaignProgress, bool) {
	ctx, cancel := mysqlCtx()
	defer cancel()

	var raw []byte
	var updatedAt sql.NullTime
	err := s.db.QueryRowContext(ctx, `
		SELECT data, updated_at
		FROM campaign_progress
		WHERE campaign_id = ?
	`, campaignID).Scan(&raw, &updatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return models.CampaignProgress{
			CampaignID: campaignID,
			Milestones: []models.CampaignMilestone{},
			UpdatedAt:  Now(),
		}, false
	}
	if err != nil {
		logMySQLError("GetCampaignProgress", err)
		return models.CampaignProgress{}, false
	}

	progress, err := decodePayload[models.CampaignProgress](raw)
	if err != nil {
		return models.CampaignProgress{}, false
	}
	if updatedAt.Valid {
		progress.UpdatedAt = updatedAt.Time
	}
	progress.CampaignID = campaignID
	return progress, true
}

func (s *MySQLStore) SaveCampaignProgress(progress models.CampaignProgress) models.CampaignProgress {
	ctx, cancel := mysqlCtx()
	defer cancel()

	progress.UpdatedAt = Now()
	if progress.Milestones == nil {
		progress.Milestones = []models.CampaignMilestone{}
	}

	if _, err := s.db.ExecContext(ctx, `
		INSERT INTO campaign_progress (campaign_id, data, updated_at)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)
	`, progress.CampaignID, jsonPayload(progress), progress.UpdatedAt); err != nil {
		logMySQLError("SaveCampaignProgress", err)
	}
	return progress
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

	campaign, err := getCampaignTx(ctx, tx, campaignID)
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

	campaign, err := getCampaignTx(ctx, tx, campaignID)
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

	res, err := s.db.ExecContext(ctx, `
		DELETE FROM campaigns
		WHERE id = ? AND master_id = ?
	`, campaignID, masterID)
	if err != nil {
		logMySQLError("DeleteCampaign", err)
		return ErrCampaignNotFound
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrCampaignNotFound
	}
	return nil
}
