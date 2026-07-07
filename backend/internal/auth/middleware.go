package auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserContextKey contextKey = "user"

type Claims struct {
	Email     string `json:"email"`
	Name      string `json:"name,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
	Provider  string `json:"provider,omitempty"`
	Sub       string `json:"sub"`
	jwt.RegisteredClaims
}

type User struct {
	ID        string
	Email     string
	Name      string
	AvatarURL string
}

type MiddlewareOptions struct {
	JWTSecret      string
	DevAuthEnabled bool
}

func Middleware(opts MiddlewareOptions) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				http.Error(w, `{"error":"invalid authorization format"}`, http.StatusUnauthorized)
				return
			}

			if opts.DevAuthEnabled && tokenString == DevAuthToken {
				ctx := context.WithValue(r.Context(), UserContextKey, devAuthClaims())
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			if opts.JWTSecret == "" {
				http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return []byte(opts.JWTSecret), nil
			})

			if err != nil || !token.Valid {
				http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	claims, ok := ctx.Value(UserContextKey).(*Claims)
	return claims, ok
}

func UserFromContext(ctx context.Context) (User, bool) {
	claims, ok := ClaimsFromContext(ctx)
	if !ok {
		return User{}, false
	}
	userID := claims.Sub
	if userID == "" {
		userID = claims.RegisteredClaims.Subject
	}
	if userID == "" {
		userID = claims.Email
	}
	return User{
		ID:        userID,
		Email:     claims.Email,
		Name:      claims.Name,
		AvatarURL: claims.AvatarURL,
	}, true
}
