package auth

import (
	"github.com/golang-jwt/jwt/v5"
)

// Dev-auth совместим с фронтовой заглушкой (frontend/src/lib/devAuth.ts).
const (
	DevAuthToken     = "dev-stub-token"
	DevAuthUserID    = "user-demo"
	DevAuthUserEmail = "dev@dndcrime.local"
)

func devAuthClaims() *Claims {
	return &Claims{
		Email: DevAuthUserEmail,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: DevAuthUserID,
		},
	}
}
