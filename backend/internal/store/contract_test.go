package store_test

// Регрессионные контракт-тесты для поведения, закреплённого после багфиксов аудита.
// Гоняются против MemoryStore (без БД и внешних зависимостей — работают в текущем
// CI `go test ./...`). MemoryStore — эталон контракта, к которому подогнан MySQLStore;
// тесты фиксируют ожидаемую семантику и ловят регрессии в in-memory реализации.
// SQL-специфику MySQLStore (ErrNoRows vs реальная ошибка, FOR UPDATE) эти тесты НЕ
// покрывают — для неё нужна интеграция с реальной MySQL (см. остаточный риск в PR).

import (
	"errors"
	"testing"

	"github.com/kate/dndcrime/internal/models"
	"github.com/kate/dndcrime/internal/store"
)

func newCampaign(t *testing.T, st store.Store, master string, maxPlayers int) models.Campaign {
	t.Helper()
	c, err := st.CreateCampaign(models.Campaign{
		Name:       "Test Campaign",
		MasterID:   master,
		PlayerIDs:  []string{master},
		MaxPlayers: maxPlayers,
	}, models.CharacterQuestionnaire{Title: "Q"})
	if err != nil {
		t.Fatalf("CreateCampaign: unexpected error: %v", err)
	}
	if c.ID == "" {
		t.Fatal("CreateCampaign returned empty ID")
	}
	return c
}

// HIGH #1: EnsureProfile не должен затирать существующий профиль дефолтами.
func TestEnsureProfile_DoesNotClobberExisting(t *testing.T) {
	st := store.NewMemory()
	const uid = "contract-ensure-existing"

	st.SaveProfile(models.UserProfile{
		UserID:      uid,
		Email:       "user@example.com",
		Name:        "Custom Name",
		Description: "my custom description",
	})

	got, err := st.EnsureProfile(models.UserProfile{
		UserID:      uid,
		Email:       "user@example.com",
		Name:        "Default From Token",
		Description: "",
	})
	if err != nil {
		t.Fatalf("EnsureProfile: unexpected error: %v", err)
	}
	if got.Name != "Custom Name" {
		t.Errorf("Name clobbered: got %q, want %q", got.Name, "Custom Name")
	}
	if got.Description != "my custom description" {
		t.Errorf("Description clobbered: got %q, want %q", got.Description, "my custom description")
	}
}

// HIGH #1: EnsureProfile создаёт профиль, если его ещё нет.
func TestEnsureProfile_CreatesWhenAbsent(t *testing.T) {
	st := store.NewMemory()
	const uid = "contract-ensure-absent"

	got, err := st.EnsureProfile(models.UserProfile{UserID: uid, Name: "Fresh"})
	if err != nil {
		t.Fatalf("EnsureProfile: unexpected error: %v", err)
	}
	if got.Name != "Fresh" {
		t.Errorf("got Name %q, want %q", got.Name, "Fresh")
	}

	stored, ok := st.GetProfile(uid)
	if !ok {
		t.Fatal("profile not persisted after EnsureProfile")
	}
	if stored.Name != "Fresh" {
		t.Errorf("persisted Name %q, want %q", stored.Name, "Fresh")
	}
}

// SaveProfile сохраняет семантику UpdateProfile (перезапись — намеренная).
func TestSaveProfile_Overwrites(t *testing.T) {
	st := store.NewMemory()
	const uid = "contract-save-overwrite"

	st.SaveProfile(models.UserProfile{UserID: uid, Name: "A", Description: "first"})
	st.SaveProfile(models.UserProfile{UserID: uid, Name: "B", Description: ""})

	got, ok := st.GetProfile(uid)
	if !ok {
		t.Fatal("profile missing")
	}
	if got.Name != "B" || got.Description != "" {
		t.Errorf("SaveProfile did not overwrite: got Name=%q Description=%q", got.Name, got.Description)
	}
}

// HIGH #2: заметки прогресса не должны теряться при добавлении/сохранении.
func TestCampaignProgress_NotesPreserved(t *testing.T) {
	st := store.NewMemory()
	c := newCampaign(t, st, "contract-master", 4)

	if _, err := st.CreateCampaignProgressNote(c.ID, models.CampaignProgressNote{Content: "note 1", AuthorID: "contract-master"}); err != nil {
		t.Fatalf("CreateCampaignProgressNote 1: %v", err)
	}
	p2, err := st.CreateCampaignProgressNote(c.ID, models.CampaignProgressNote{Content: "note 2", AuthorID: "contract-master"})
	if err != nil {
		t.Fatalf("CreateCampaignProgressNote 2: %v", err)
	}
	if len(p2.Notes) != 2 {
		t.Fatalf("after two notes: got %d notes, want 2", len(p2.Notes))
	}

	// Сохранение главы НЕ должно стирать накопленные заметки.
	saved, err := st.SaveCampaignProgress(models.CampaignProgress{CampaignID: c.ID, CurrentChapter: "Chapter 2"})
	if err != nil {
		t.Fatalf("SaveCampaignProgress: %v", err)
	}
	if len(saved.Notes) != 2 {
		t.Errorf("SaveCampaignProgress wiped notes: got %d, want 2", len(saved.Notes))
	}
	if saved.CurrentChapter != "Chapter 2" {
		t.Errorf("CurrentChapter not updated: got %q", saved.CurrentChapter)
	}

	got, found, err := st.GetCampaignProgress(c.ID)
	if err != nil {
		t.Fatalf("GetCampaignProgress: %v", err)
	}
	if !found {
		t.Fatal("progress not found")
	}
	if len(got.Notes) != 2 {
		t.Errorf("GetCampaignProgress notes: got %d, want 2", len(got.Notes))
	}
}

// HIGH #2: удаление одной заметки убирает только её.
func TestDeleteCampaignProgressNote_RemovesOnlyTarget(t *testing.T) {
	st := store.NewMemory()
	c := newCampaign(t, st, "contract-master", 4)

	first, err := st.CreateCampaignProgressNote(c.ID, models.CampaignProgressNote{Content: "note 1"})
	if err != nil {
		t.Fatalf("create note 1: %v", err)
	}
	targetID := first.Notes[0].ID
	if _, err := st.CreateCampaignProgressNote(c.ID, models.CampaignProgressNote{Content: "note 2"}); err != nil {
		t.Fatalf("create note 2: %v", err)
	}

	after, err := st.DeleteCampaignProgressNote(c.ID, targetID)
	if err != nil {
		t.Fatalf("DeleteCampaignProgressNote: %v", err)
	}
	if len(after.Notes) != 1 {
		t.Fatalf("after delete: got %d notes, want 1", len(after.Notes))
	}
	if after.Notes[0].Content != "note 2" {
		t.Errorf("wrong note removed: remaining Content=%q, want %q", after.Notes[0].Content, "note 2")
	}
}

// MED #3: CreateCampaign возвращает валидную кампанию + анкету + чат, без ошибки.
func TestCreateCampaign_CreatesQuestionnaireAndChat(t *testing.T) {
	st := store.NewMemory()
	c := newCampaign(t, st, "contract-master", 3)

	if c.Status != models.CampaignActive {
		t.Errorf("Status: got %q, want %q", c.Status, models.CampaignActive)
	}
	if q, ok := st.GetQuestionnaire(c.ID); !ok || q.CampaignID != c.ID {
		t.Errorf("questionnaire not created for campaign %s (ok=%v)", c.ID, ok)
	}
	if chat, ok := st.GetCampaignChat(c.ID); !ok || chat.CampaignID != c.ID {
		t.Errorf("campaign chat not created for campaign %s (ok=%v)", c.ID, ok)
	}
}

// MED #4: DeleteCampaign убирает зависимые данные (персонажи, событие, invite-пост).
func TestDeleteCampaign_CleansDependents(t *testing.T) {
	st := store.NewMemory()
	const master = "contract-del-master"
	c := newCampaign(t, st, master, 4)

	st.CreateCharacter(models.Character{OwnerID: master, CampaignID: c.ID, Name: "Hero"})
	if _, err := st.CreateCalendarEvent(models.CalendarEvent{Date: "2026-08-01", Title: "Session", CampaignID: c.ID, CreatedBy: master}); err != nil {
		t.Fatalf("CreateCalendarEvent: %v", err)
	}
	post, _, err := st.PublishCampaignInvitation(c.ID, master, "Master")
	if err != nil {
		t.Fatalf("PublishCampaignInvitation: %v", err)
	}
	if post.ID == "" {
		t.Fatal("invitation post has empty ID")
	}

	if err := st.DeleteCampaign(c.ID, master); err != nil {
		t.Fatalf("DeleteCampaign: %v", err)
	}

	if _, ok := st.GetCampaign(c.ID); ok {
		t.Error("campaign still present after delete")
	}
	if chars := st.ListCharactersByCampaign(c.ID); len(chars) != 0 {
		t.Errorf("characters orphaned: got %d, want 0", len(chars))
	}
	for _, p := range st.ListNewsPosts() {
		if p.ID == post.ID {
			t.Error("invitation news post still present after campaign delete")
		}
	}
	for _, e := range st.ListCalendarEventsForUser(master) {
		if e.CampaignID == c.ID {
			t.Error("calendar event orphaned after campaign delete")
		}
	}
}

// MED #4: удаление чужой кампании запрещено и ничего не трогает.
func TestDeleteCampaign_WrongMaster(t *testing.T) {
	st := store.NewMemory()
	c := newCampaign(t, st, "contract-owner", 2)

	err := st.DeleteCampaign(c.ID, "someone-else")
	if !errors.Is(err, store.ErrCampaignNotFound) {
		t.Fatalf("got err %v, want ErrCampaignNotFound", err)
	}
	if _, ok := st.GetCampaign(c.ID); !ok {
		t.Error("campaign was removed by non-master delete")
	}
}

// LOW #9: IsCampaignMaster/IsCampaignMember возвращают (bool, nil) без ошибки.
func TestMembershipChecks(t *testing.T) {
	st := store.NewMemory()
	const master = "contract-mm-master"
	c := newCampaign(t, st, master, 3)

	if isMaster, err := st.IsCampaignMaster(c.ID, master); err != nil || !isMaster {
		t.Errorf("IsCampaignMaster(master) = (%v, %v), want (true, nil)", isMaster, err)
	}
	if isMaster, err := st.IsCampaignMaster(c.ID, "nobody"); err != nil || isMaster {
		t.Errorf("IsCampaignMaster(nobody) = (%v, %v), want (false, nil)", isMaster, err)
	}

	if _, err := st.JoinCampaign(c.ID, "contract-mm-player"); err != nil {
		t.Fatalf("JoinCampaign: %v", err)
	}
	if isMember, err := st.IsCampaignMember(c.ID, "contract-mm-player"); err != nil || !isMember {
		t.Errorf("IsCampaignMember(player) = (%v, %v), want (true, nil)", isMember, err)
	}
	if isMember, err := st.IsCampaignMember(c.ID, "stranger"); err != nil || isMember {
		t.Errorf("IsCampaignMember(stranger) = (%v, %v), want (false, nil)", isMember, err)
	}
	// Отсутствующая кампания — не участник, но и не ошибка.
	if isMember, err := st.IsCampaignMember("no-such-campaign", master); err != nil || isMember {
		t.Errorf("IsCampaignMember(missing campaign) = (%v, %v), want (false, nil)", isMember, err)
	}
}

// MED #5: JoinCampaign соблюдает MaxPlayers и не пускает повторно.
func TestJoinCampaign_EnforcesLimits(t *testing.T) {
	st := store.NewMemory()
	const master = "contract-join-master"
	// PlayerIDs = [master], MaxPlayers = 2 → доступно ровно одно место для игрока.
	c := newCampaign(t, st, master, 2)

	if _, err := st.JoinCampaign(c.ID, "player-1"); err != nil {
		t.Fatalf("first join should succeed, got %v", err)
	}
	if _, err := st.JoinCampaign(c.ID, "player-2"); !errors.Is(err, store.ErrCampaignFull) {
		t.Errorf("second join: got %v, want ErrCampaignFull", err)
	}
	if _, err := st.JoinCampaign(c.ID, "player-1"); !errors.Is(err, store.ErrAlreadyMember) {
		t.Errorf("re-join: got %v, want ErrAlreadyMember", err)
	}
	if _, err := st.JoinCampaign(c.ID, master); !errors.Is(err, store.ErrAlreadyMember) {
		t.Errorf("master join: got %v, want ErrAlreadyMember", err)
	}
}

// MED #5: PublishCampaignInvitation идемпотентен (нет дублей приглашений).
func TestPublishCampaignInvitation_NoDuplicates(t *testing.T) {
	st := store.NewMemory()
	const master = "contract-inv-master"
	c := newCampaign(t, st, master, 3)

	if _, _, err := st.PublishCampaignInvitation(c.ID, master, "Master"); err != nil {
		t.Fatalf("first publish: %v", err)
	}
	if _, _, err := st.PublishCampaignInvitation(c.ID, master, "Master"); !errors.Is(err, store.ErrInvitationExists) {
		t.Errorf("second publish: got %v, want ErrInvitationExists", err)
	}
	if _, _, err := st.PublishCampaignInvitation(c.ID, "not-master", "X"); !errors.Is(err, store.ErrCampaignNotFound) {
		t.Errorf("non-master publish: got %v, want ErrCampaignNotFound", err)
	}
}

// MED #5: AddCharacterAchievement добавляет ачивку владельцу и запрещает чужому.
func TestAddCharacterAchievement(t *testing.T) {
	st := store.NewMemory()
	const owner = "contract-ach-owner"
	ch := st.CreateCharacter(models.Character{OwnerID: owner, Name: "Hero"})

	got, ok := st.AddCharacterAchievement(ch.ID, owner, models.AntiAchievement{Title: "Oops"})
	if !ok {
		t.Fatal("AddCharacterAchievement(owner) returned ok=false")
	}
	if len(got.AntiAchievements) != 1 {
		t.Errorf("achievements: got %d, want 1", len(got.AntiAchievements))
	}
	if _, ok := st.AddCharacterAchievement(ch.ID, "not-owner", models.AntiAchievement{Title: "X"}); ok {
		t.Error("AddCharacterAchievement(not-owner) returned ok=true, want false")
	}
}

// MED #5: конкурентный JoinCampaign не превышает MaxPlayers (mutex-контракт).
func TestJoinCampaign_ConcurrentDoesNotExceedMax(t *testing.T) {
	st := store.NewMemory()
	const master = "contract-conc-master"
	const maxPlayers = 5
	c := newCampaign(t, st, master, maxPlayers)

	const attempts = 25
	done := make(chan struct{})
	for i := 0; i < attempts; i++ {
		userID := "conc-player-" + string(rune('a'+i%26)) + string(rune('0'+i/26))
		go func(uid string) {
			defer func() { done <- struct{}{} }()
			_, _ = st.JoinCampaign(c.ID, uid)
		}(userID)
	}
	for i := 0; i < attempts; i++ {
		<-done
	}

	got, ok := st.GetCampaign(c.ID)
	if !ok {
		t.Fatal("campaign missing")
	}
	if len(got.PlayerIDs) > maxPlayers {
		t.Errorf("PlayerIDs exceeded MaxPlayers: got %d, want <= %d", len(got.PlayerIDs), maxPlayers)
	}
}
