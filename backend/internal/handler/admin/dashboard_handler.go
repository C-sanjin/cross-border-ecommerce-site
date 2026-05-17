package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service/admin"
)

type DashboardHandler struct {
	dashboardService *admin.DashboardService
}

func NewDashboardHandler(dashboardService *admin.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

func (h *DashboardHandler) GetStats(c *fiber.Ctx) error {
	stats, err := h.dashboardService.GetStats()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(stats)
}

func (h *DashboardHandler) GetOrderStatusCounts(c *fiber.Ctx) error {
	counts, err := h.dashboardService.GetOrderStatusCounts()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"status_counts": counts})
}

func (h *DashboardHandler) GetTopProducts(c *fiber.Ctx) error {
	limit := 10
	if l := c.Query("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil {
			limit = v
		}
	}

	products, err := h.dashboardService.GetTopProducts(limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"top_products": products})
}
