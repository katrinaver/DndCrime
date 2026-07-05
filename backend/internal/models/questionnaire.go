package models

type QuestionnaireFieldType string

const (
	FieldText        QuestionnaireFieldType = "text"
	FieldTextarea    QuestionnaireFieldType = "textarea"
	FieldSelect      QuestionnaireFieldType = "select"
	FieldMultiselect QuestionnaireFieldType = "multiselect"
	FieldFile        QuestionnaireFieldType = "file"
)

type QuestionnaireField struct {
	ID          string                 `json:"id"`
	Label       string                 `json:"label"`
	Type        QuestionnaireFieldType `json:"type"`
	Options     []string               `json:"options,omitempty"`
	Placeholder string                 `json:"placeholder,omitempty"`
	Section     string                 `json:"section,omitempty"`
}

type QuestionnaireFieldSetting struct {
	FieldID         string   `json:"fieldId"`
	Enabled         bool     `json:"enabled"`
	SelectedOptions []string `json:"selectedOptions"`
}

// CharacterQuestionnaire — анкета создания персонажа для кампании.
type CharacterQuestionnaire struct {
	CampaignID  string              `json:"campaignId"`
	Title       string              `json:"title"`
	Description string              `json:"description"`
	Fields      []QuestionnaireField `json:"fields"`
}

type QuestionnaireSubmission struct {
	Answers map[string]string `json:"answers"`
}
