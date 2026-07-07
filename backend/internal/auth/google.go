package auth

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const googleJWKSURL = "https://www.googleapis.com/oauth2/v3/certs"

type GoogleUser struct {
	Subject string
	Email   string
	Name    string
	Picture string
}

type googleIDClaims struct {
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	jwt.RegisteredClaims
}

type googleJWKSet struct {
	Keys []googleJWK `json:"keys"`
}

type googleJWK struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	N   string `json:"n"`
	E   string `json:"e"`
}

var googleKeysCache = struct {
	sync.Mutex
	keys      map[string]*rsa.PublicKey
	expiresAt time.Time
}{}

func ValidateGoogleIDToken(ctx context.Context, tokenString, clientID string) (GoogleUser, error) {
	claims := &googleIDClaims{}
	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(t *jwt.Token) (interface{}, error) {
			if t.Method.Alg() != jwt.SigningMethodRS256.Alg() {
				return nil, fmt.Errorf("unexpected signing method: %s", t.Method.Alg())
			}
			kid, _ := t.Header["kid"].(string)
			if kid == "" {
				return nil, errors.New("google token does not include kid")
			}
			return googlePublicKey(ctx, kid)
		},
		jwt.WithValidMethods([]string{jwt.SigningMethodRS256.Alg()}),
	)
	if err != nil || !token.Valid {
		if err == nil {
			err = errors.New("token is invalid")
		}
		return GoogleUser{}, err
	}

	now := time.Now().UTC()
	if claims.ExpiresAt == nil || claims.ExpiresAt.Time.Before(now) {
		return GoogleUser{}, errors.New("token is expired")
	}
	if claims.Subject == "" {
		return GoogleUser{}, errors.New("token subject is empty")
	}
	if claims.Email == "" {
		return GoogleUser{}, errors.New("token email is empty")
	}
	if !claims.EmailVerified {
		return GoogleUser{}, errors.New("google email is not verified")
	}
	if claims.Issuer != "https://accounts.google.com" && claims.Issuer != "accounts.google.com" {
		return GoogleUser{}, errors.New("unexpected token issuer")
	}
	if !claimStringsContain(claims.Audience, clientID) {
		return GoogleUser{}, errors.New("unexpected token audience")
	}

	return GoogleUser{
		Subject: claims.Subject,
		Email:   claims.Email,
		Name:    claims.Name,
		Picture: claims.Picture,
	}, nil
}

func googlePublicKey(ctx context.Context, kid string) (*rsa.PublicKey, error) {
	if key := cachedGooglePublicKey(kid); key != nil {
		return key, nil
	}
	if err := refreshGooglePublicKeys(ctx); err != nil {
		return nil, err
	}
	if key := cachedGooglePublicKey(kid); key != nil {
		return key, nil
	}
	return nil, fmt.Errorf("google key %q not found", kid)
}

func cachedGooglePublicKey(kid string) *rsa.PublicKey {
	googleKeysCache.Lock()
	defer googleKeysCache.Unlock()

	if time.Now().After(googleKeysCache.expiresAt) {
		return nil
	}
	return googleKeysCache.keys[kid]
}

func refreshGooglePublicKeys(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, googleJWKSURL, nil)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("google jwks returned %s", resp.Status)
	}

	var set googleJWKSet
	if err := json.NewDecoder(resp.Body).Decode(&set); err != nil {
		return err
	}

	keys := make(map[string]*rsa.PublicKey, len(set.Keys))
	for _, jwk := range set.Keys {
		if jwk.Kty != "RSA" || jwk.Alg != jwt.SigningMethodRS256.Alg() {
			continue
		}
		key, err := rsaPublicKeyFromJWK(jwk)
		if err != nil {
			return err
		}
		keys[jwk.Kid] = key
	}
	if len(keys) == 0 {
		return errors.New("google jwks did not include usable RSA keys")
	}

	googleKeysCache.Lock()
	googleKeysCache.keys = keys
	googleKeysCache.expiresAt = time.Now().Add(time.Hour)
	googleKeysCache.Unlock()

	return nil
}

func rsaPublicKeyFromJWK(jwk googleJWK) (*rsa.PublicKey, error) {
	modulusBytes, err := base64.RawURLEncoding.DecodeString(jwk.N)
	if err != nil {
		return nil, err
	}
	exponentBytes, err := base64.RawURLEncoding.DecodeString(jwk.E)
	if err != nil {
		return nil, err
	}

	exponent := new(big.Int).SetBytes(exponentBytes).Int64()
	if exponent <= 0 {
		return nil, errors.New("invalid RSA exponent")
	}

	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(modulusBytes),
		E: int(exponent),
	}, nil
}

func claimStringsContain(values jwt.ClaimStrings, expected string) bool {
	for _, value := range values {
		if value == expected {
			return true
		}
	}
	return false
}
