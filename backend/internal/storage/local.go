package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type LocalUploader struct {
	rootDir string
}

func NewLocalUploader(rootDir string) *LocalUploader {
	_ = os.MkdirAll(rootDir, 0o755)
	return &LocalUploader{rootDir: rootDir}
}

func (l *LocalUploader) Configured() bool {
	return l != nil
}

func (l *LocalUploader) Upload(_ context.Context, objectKey, _ string, body []byte) (string, error) {
	if objectKey == "" {
		return "", fmt.Errorf("object key is required")
	}
	cleanKey := filepath.Clean(objectKey)
	if cleanKey == "." || strings.HasPrefix(cleanKey, "..") {
		return "", fmt.Errorf("invalid object key")
	}

	fullPath := filepath.Join(l.rootDir, cleanKey)
	if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
		return "", err
	}
	if err := os.WriteFile(fullPath, body, 0o644); err != nil {
		return "", err
	}
	return cleanKey, nil
}

func (l *LocalUploader) FilePath(objectKey string) (string, error) {
	cleanKey := filepath.Clean(objectKey)
	if cleanKey == "." || strings.HasPrefix(cleanKey, "..") {
		return "", fmt.Errorf("invalid object key")
	}
	fullPath := filepath.Join(l.rootDir, cleanKey)
	if !strings.HasPrefix(fullPath, l.rootDir) {
		return "", fmt.Errorf("invalid object key")
	}
	return fullPath, nil
}

type CompositeUploader struct {
	s3    *S3Client
	local *LocalUploader
}

func NewCompositeUploader(s3 *S3Client, localRoot string) *CompositeUploader {
	return &CompositeUploader{
		s3:    s3,
		local: NewLocalUploader(localRoot),
	}
}

func (c *CompositeUploader) Configured() bool {
	return c != nil && (c.s3.Configured() || c.local.Configured())
}

func (c *CompositeUploader) UsesLocal() bool {
	return c != nil && !c.s3.Configured()
}

func (c *CompositeUploader) Upload(ctx context.Context, objectKey, contentType string, body []byte) (string, error) {
	if c.s3.Configured() {
		return c.s3.Upload(ctx, objectKey, contentType, body)
	}
	return c.local.Upload(ctx, objectKey, contentType, body)
}

func (c *CompositeUploader) LocalFilePath(objectKey string) (string, error) {
	if c.local == nil {
		return "", fmt.Errorf("local storage is not available")
	}
	return c.local.FilePath(objectKey)
}
