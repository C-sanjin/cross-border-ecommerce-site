package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
)

type CouponHandler struct {
	couponService *service.CouponService
}

func NewCouponHandler(couponService *service.CouponService) *CouponHandler {
	return &CouponHandler{couponService: couponService}
}

func (h *CouponHandler) ValidateCoupon(c *fiber.Ctx) error {
	var req service.ValidateCouponRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}
	if req.Code == "" {
		return c.Status(400).JSON(fiber.Map{"error": "coupon code is required"})
	}
	response, err := h.couponService.ValidateCoupon(&req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(response)
}

func (h *CouponHandler) ListCoupons(c *fiber.Ctx) error {
	coupons, _, err := h.couponService.ListCoupons(1, 50)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"coupons": coupons})
}
