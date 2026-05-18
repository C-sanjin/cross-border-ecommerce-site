
package middleware

import (
	"strings"
	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
)

func AuthMiddleware(authService *service.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "missing authorization header"})
		}
		
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{"error": "invalid authorization format"})
		}
		
		claims, err := authService.ValidateToken(parts[1])
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
		}
		
		c.Locals("user_id", uint((*claims)["user_id"].(float64)))
		c.Locals("email", (*claims)["email"].(string))
		
		return c.Next()
	}
}

func OptionalAuthMiddleware(authService *service.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}
		
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			claims, err := authService.ValidateToken(parts[1])
			if err == nil {
				c.Locals("user_id", uint((*claims)["user_id"].(float64)))
				c.Locals("email", (*claims)["email"].(string))
			}
		}
		
		return c.Next()
	}
}

func AdminMiddleware(authService *service.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "missing authorization header"})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{"error": "invalid authorization format"})
		}

		claims, err := authService.ValidateToken(parts[1])
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
		}

		role, _ := (*claims)["role"].(string)
		if role == "" || role == "user" {
			return c.Status(403).JSON(fiber.Map{"error": "admin access required"})
		}

		c.Locals("user_id", uint((*claims)["user_id"].(float64)))
		c.Locals("email", (*claims)["email"].(string))
		c.Locals("role", role)

		return c.Next()
	}
}
