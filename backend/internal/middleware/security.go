package middleware

import (
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

func SecurityHeaders() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Set("Content-Security-Policy", "default-src 'self'; img-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		return c.Next()
	}
}

type rateLimitEntry struct {
	Count   int
	ResetAt time.Time
}

var (
	rateLimitMap sync.Map
	cleanupOnce  sync.Once
)

func startRateLimitCleanup() {
	go func() {
		ticker := time.NewTicker(2 * time.Minute)
		for range ticker.C {
			now := time.Now()
			rateLimitMap.Range(func(key, value interface{}) bool {
				entry := value.(*rateLimitEntry)
				if now.After(entry.ResetAt) {
					rateLimitMap.Delete(key)
				}
				return true
			})
		}
	}()
}

func RateLimiter(maxRequests int) fiber.Handler {
	cleanupOnce.Do(startRateLimitCleanup)
	window := 1 * time.Minute

	return func(c *fiber.Ctx) error {
		ip := c.IP()
		now := time.Now()

		val, _ := rateLimitMap.LoadOrStore(ip, &rateLimitEntry{
			Count:   0,
			ResetAt: now.Add(window),
		})
		entry := val.(*rateLimitEntry)

		if now.After(entry.ResetAt) {
			entry.Count = 0
			entry.ResetAt = now.Add(window)
		}

		if entry.Count >= maxRequests {
			return c.Status(429).JSON(fiber.Map{
				"error": "too many requests, please try again later",
			})
		}

		entry.Count++
		return c.Next()
	}
}