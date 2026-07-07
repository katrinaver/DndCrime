package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	tokenIssuer   = "dndcrime"
	tokenAudience = "dndcrime-web"
)

type Service struct {
	GoogleClientID string
	JWTSecret      string
	TokenTTL       time.Duration
}

func NewService(googleClientID, jwtSecret string) Service {
	return Service{
		GoogleClientID: googleClientID,
		JWTSecret:      jwtSecret,
		TokenTTL:       7 * 24 * time.Hour,
	}
}

func (s Service) AuthenticateGoogle(ctx context.Context, credential string) (User, string, error) {
	if s.GoogleClientID == "" {
		return User{}, "", errors.New("GOOGLE_CLIENT_ID is not configured")
	}
	if s.JWTSecret == "" {
		return User{}, "", errors.New("APP_JWT_SECRET is not configured")
	}
	if credential == "" {
		return User{}, "", errors.New("credential is required")
	}

	googleUser, err := ValidateGoogleIDToken(ctx, credential, s.GoogleClientID)
	if err != nil {
		return User{}, "", fmt.Errorf("invalid google credential: %w", err)
	}

	user := User{
		ID:        "google:" + googleUser.Subject,
		Email:     googleUser.Email,
		Name:      googleUser.Name,
		AvatarURL: googleUser.Picture,
	}

	token, err := s.IssueToken(user)
	if err != nil {
		return User{}, "", err
	}

	return user, token, nil
}

func (s Service) IssueToken(user User) (string, error) {
	if s.JWTSecret == "" {
		return "", errors.New("APP_JWT_SECRET is not configured")
	}

	now := time.Now().UTC()
	ttl := s.TokenTTL
	if ttl <= 0 {
		ttl = 7 * 24 * time.Hour
	}

	claims := Claims{
		Email:     user.Email,
		Name:      user.Name,
		AvatarURL: user.AvatarURL,
		Provider:  "google",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			Issuer:    tokenIssuer,
			Audience:  jwt.ClaimStrings{tokenAudience},
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}

	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(s.JWTSecret))
}
