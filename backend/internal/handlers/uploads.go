package handlers

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/kate/dndcrime/internal/auth"
	"github.com/kate/dndcrime/internal/httpx"
	"github.com/kate/dndcrime/internal/id"
)

const maxUploadBytes int64 = 10 * 1024 * 1024

type uploadResponse struct {
	URL string `json:"url"`
	Key string `json:"key"`
}

func (h *Handler) UploadFile(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if h.uploader == nil || !h.uploader.Configured() {
		httpx.WriteError(w, http.StatusServiceUnavailable, "file uploads are not configured")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes+(1<<20))
	if err := r.ParseMultipartForm(maxUploadBytes + (1 << 20)); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	body, err := io.ReadAll(io.LimitReader(file, maxUploadBytes+1))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "failed to read file")
		return
	}
	if int64(len(body)) > maxUploadBytes {
		httpx.WriteError(w, http.StatusRequestEntityTooLarge, "file is too large")
		return
	}

	contentType := header.Header.Get("Content-Type")
	if contentType == "" && len(body) > 0 {
		contentType = http.DetectContentType(body)
	}
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	kind := r.FormValue("kind")
	if kind == "avatar" && !strings.HasPrefix(contentType, "image/") {
		httpx.WriteError(w, http.StatusBadRequest, "avatar must be an image")
		return
	}

	objectKey := buildObjectKey(kind, user.ID, header.Filename, contentType)
	url, err := h.uploader.Upload(r.Context(), objectKey, contentType, body)
	if err != nil {
		httpx.WriteError(w, http.StatusBadGateway, "failed to upload file")
		return
	}

	httpx.WriteJSON(w, http.StatusCreated, uploadResponse{URL: url, Key: objectKey})
}

func buildObjectKey(kind, userID, filename, contentType string) string {
	now := time.Now().UTC()
	prefix := uploadPrefix(kind)
	name := sanitizeFilename(filename, contentType)
	return fmt.Sprintf(
		"%s/%s/%s/%s-%s",
		prefix,
		safePathSegment(userID),
		now.Format("2006/01"),
		id.New(),
		name,
	)
}

func uploadPrefix(kind string) string {
	switch kind {
	case "avatar":
		return "avatars"
	case "attachment":
		return "attachments"
	default:
		return "uploads"
	}
}

func sanitizeFilename(filename, contentType string) string {
	name := path.Base(strings.ReplaceAll(filename, "\\", "/"))
	ext := sanitizeExtension(path.Ext(name))
	base := strings.TrimSuffix(name, path.Ext(name))
	if base == "" || base == "." || base == "/" {
		base = "file"
	}

	safeBase := safePathSegment(base)
	if safeBase == "unknown" {
		safeBase = "file"
	}

	if ext == "" {
		if extensions, err := mime.ExtensionsByType(contentType); err == nil && len(extensions) > 0 {
			ext = sanitizeExtension(extensions[0])
		}
	}

	return safeBase + ext
}

func sanitizeExtension(ext string) string {
	if ext == "" {
		return ""
	}
	ext = strings.ToLower(ext)
	if len(ext) > 16 || ext[0] != '.' {
		return ""
	}
	for _, r := range ext[1:] {
		if (r < 'a' || r > 'z') && (r < '0' || r > '9') {
			return ""
		}
	}
	return ext
}

func safePathSegment(value string) string {
	value = strings.ToLower(value)
	var b strings.Builder
	lastDash := false
	for _, r := range value {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
			lastDash = false
			continue
		}
		if r == '-' || r == '_' || r == '.' {
			if !lastDash && b.Len() > 0 {
				b.WriteByte('-')
				lastDash = true
			}
		}
	}

	out := strings.Trim(b.String(), "-")
	if out == "" {
		return "unknown"
	}
	return out
}
