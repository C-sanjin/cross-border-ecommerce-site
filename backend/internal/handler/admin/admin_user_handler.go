package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service/admin"
)

type AdminUserHandler struct {
	adminUserService *admin.AdminUserAdminService
}

func NewAdminUserHandler(adminUserService *admin.AdminUserAdminService) *AdminUserHandler {
	return &AdminUserHandler{adminUserService: adminUserService}
}

func (h *AdminUserHandler) ListAdminUsers(c *fiber.Ctx) error {
	page := 1
	pageSize := 20

	if p := c.Query("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			page = v
		}
	}
	if ps := c.Query("page_size"); ps != "" {
		if v, err := strconv.Atoi(ps); err == nil {
			pageSize = v
		}
	}

	status := c.Query("status")

	result, err := h.adminUserService.ListAdminUsers(page, pageSize, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(result)
}

func (h *AdminUserHandler) GetAdminUser(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid admin user id"})
	}

	user, err := h.adminUserService.GetAdminUser(uint(id))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "admin user not found"})
	}

	return c.JSON(user)
}

func (h *AdminUserHandler) CreateAdminUser(c *fiber.Ctx) error {
	var req admin.CreateAdminUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	user, err := h.adminUserService.CreateAdminUser(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(user)
}

func (h *AdminUserHandler) UpdateAdminUserStatus(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid admin user id"})
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if err := h.adminUserService.UpdateAdminUserStatus(uint(id), body.Status); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "status updated"})
}

func (h *AdminUserHandler) DeleteAdminUser(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid admin user id"})
	}

	currentUserID := c.Locals("user_id").(uint)

	if err := h.adminUserService.DeleteAdminUser(uint(id), currentUserID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "admin user deleted"})
}