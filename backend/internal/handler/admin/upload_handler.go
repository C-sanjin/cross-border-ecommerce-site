package handler

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
)

type UploadHandler struct {
	uploadDir string
	baseURL   string
}

func NewUploadHandler(uploadDir, baseURL string) *UploadHandler {
	os.MkdirAll(uploadDir, 0755)
	return &UploadHandler{uploadDir: uploadDir, baseURL: baseURL}
}

func (h *UploadHandler) UploadImage(c *fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "no image file provided"})
	}

	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".jpg"
	}

	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join(h.uploadDir, filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to save image"})
	}

	url := fmt.Sprintf("%s/%s", h.baseURL, filename)
	return c.JSON(fiber.Map{"url": url, "filename": filename})
}

func (h *UploadHandler) UploadImages(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "no images provided"})
	}

	files := form.File["images"]
	if len(files) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "no images provided"})
	}

	var urls []string
	for _, file := range files {
		ext := filepath.Ext(file.Filename)
		if ext == "" {
			ext = ".jpg"
		}
		filename := fmt.Sprintf("%d_%d%s", time.Now().UnixNano(), len(urls), ext)
		savePath := filepath.Join(h.uploadDir, filename)
		if err := c.SaveFile(file, savePath); err != nil {
			continue
		}
		urls = append(urls, fmt.Sprintf("%s/%s", h.baseURL, filename))
	}

	return c.JSON(fiber.Map{"urls": urls})
}