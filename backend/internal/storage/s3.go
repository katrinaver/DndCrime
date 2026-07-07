package storage

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"path"
	"sort"
	"strings"
	"time"
)

const awsRegion = "ru-central1"

type S3Config struct {
	AccessKey  string
	SecretKey  string
	Endpoint   string
	Bucket     string
	PublicBase string
}

type S3Client struct {
	cfg        S3Config
	httpClient *http.Client
}

func NewS3Client(cfg S3Config) *S3Client {
	return &S3Client{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *S3Client) Configured() bool {
	return c != nil &&
		c.cfg.AccessKey != "" &&
		c.cfg.SecretKey != "" &&
		c.cfg.Endpoint != "" &&
		c.cfg.Bucket != ""
}

func (c *S3Client) Upload(ctx context.Context, objectKey, contentType string, body []byte) (string, error) {
	if !c.Configured() {
		return "", fmt.Errorf("s3 is not configured")
	}
	if objectKey == "" {
		return "", fmt.Errorf("object key is required")
	}
	if contentType == "" {
		contentType = mime.TypeByExtension(path.Ext(objectKey))
	}
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	endpoint, err := url.Parse(c.cfg.Endpoint)
	if err != nil {
		return "", err
	}
	endpoint.Path = path.Join(endpoint.Path, c.cfg.Bucket, objectKey)

	payloadHash := sha256Hex(body)
	now := time.Now().UTC()

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, endpoint.String(), bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("X-Amz-Content-Sha256", payloadHash)
	req.Header.Set("X-Amz-Date", now.Format("20060102T150405Z"))

	c.sign(req, payloadHash, now)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		message, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return "", fmt.Errorf("s3 upload failed: %s %s", resp.Status, strings.TrimSpace(string(message)))
	}

	return c.PublicURL(objectKey), nil
}

func (c *S3Client) PublicURL(objectKey string) string {
	base := c.cfg.PublicBase
	if base == "" {
		base = strings.TrimRight(c.cfg.Endpoint, "/") + "/" + c.cfg.Bucket
	}
	return strings.TrimRight(base, "/") + "/" + strings.TrimLeft(objectKey, "/")
}

func (c *S3Client) sign(req *http.Request, payloadHash string, now time.Time) {
	date := now.Format("20060102")
	credentialScope := date + "/" + awsRegion + "/s3/aws4_request"
	signedHeaders := "content-type;host;x-amz-content-sha256;x-amz-date"

	canonicalRequest := strings.Join([]string{
		req.Method,
		uriEncodePath(req.URL.EscapedPath()),
		canonicalQuery(req.URL.Query()),
		"content-type:" + req.Header.Get("Content-Type") + "\n" +
			"host:" + req.URL.Host + "\n" +
			"x-amz-content-sha256:" + payloadHash + "\n" +
			"x-amz-date:" + req.Header.Get("X-Amz-Date") + "\n",
		signedHeaders,
		payloadHash,
	}, "\n")

	stringToSign := strings.Join([]string{
		"AWS4-HMAC-SHA256",
		req.Header.Get("X-Amz-Date"),
		credentialScope,
		sha256Hex([]byte(canonicalRequest)),
	}, "\n")

	signingKey := deriveSigningKey(c.cfg.SecretKey, date, awsRegion, "s3")
	signature := hex.EncodeToString(hmacSHA256(signingKey, []byte(stringToSign)))

	req.Header.Set("Authorization", fmt.Sprintf(
		"AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		c.cfg.AccessKey,
		credentialScope,
		signedHeaders,
		signature,
	))
}

func canonicalQuery(values url.Values) string {
	if len(values) == 0 {
		return ""
	}

	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	parts := make([]string, 0)
	for _, key := range keys {
		vals := append([]string(nil), values[key]...)
		sort.Strings(vals)
		for _, value := range vals {
			parts = append(parts, url.QueryEscape(key)+"="+url.QueryEscape(value))
		}
	}
	return strings.Join(parts, "&")
}

func uriEncodePath(value string) string {
	if value == "" {
		return "/"
	}
	segments := strings.Split(value, "/")
	for i, segment := range segments {
		segments[i] = url.PathEscape(segment)
	}
	return strings.Join(segments, "/")
}

func deriveSigningKey(secret, date, region, service string) []byte {
	kDate := hmacSHA256([]byte("AWS4"+secret), []byte(date))
	kRegion := hmacSHA256(kDate, []byte(region))
	kService := hmacSHA256(kRegion, []byte(service))
	return hmacSHA256(kService, []byte("aws4_request"))
}

func hmacSHA256(key, data []byte) []byte {
	mac := hmac.New(sha256.New, key)
	_, _ = mac.Write(data)
	return mac.Sum(nil)
}

func sha256Hex(data []byte) string {
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}
