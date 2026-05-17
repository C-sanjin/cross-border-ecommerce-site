
package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req service.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	
	if req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "email and password are required"})
	}
	
	response, err := h.authService.Register(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	
	return c.Status(201).JSON(response)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req service.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	
	response, err := h.authService.Login(&req)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}
	
	return c.JSON(response)
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token"`
	}
	
	var req RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}
	
	response, err := h.authService.RefreshAccessToken(req.RefreshToken)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}
	
	return c.JSON(response)
}

func (h *AuthHandler) GetUserByID(id uint) (*model.User, error) {
	return h.authService.GetUserByID(id)
}
