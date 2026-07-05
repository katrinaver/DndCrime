package models

import "time"

type CalendarEvent struct {
	ID         string    `json:"id"`
	Date       string    `json:"date"` // YYYY-MM-DD
	Time       string    `json:"time,omitempty"`
	Title      string    `json:"title"`
	CampaignID string    `json:"campaignId,omitempty"`
	Campaign   string    `json:"campaign,omitempty"`
	Place      string    `json:"place,omitempty"`
	CreatedBy  string    `json:"createdBy,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
}

type CreateCalendarEventRequest struct {
	Date       string `json:"date"`
	Time       string `json:"time,omitempty"`
	Title      string `json:"title"`
	CampaignID string `json:"campaignId,omitempty"`
	Campaign   string `json:"campaign,omitempty"`
	Place      string `json:"place,omitempty"`
}
