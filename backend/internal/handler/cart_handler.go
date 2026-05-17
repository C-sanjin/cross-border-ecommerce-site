
package handler

import (
	"strconv"
	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
)

type CartHandler struct {
	cartService *service.CartService
}

func NewCartHandler(cartService *service.CartService) *CartHandler {
	return &CartHandler{cartService: cartService}
}

func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	cart, err := h.cartService.GetCart(userID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "cart not found"})
	}

	return c.JSON(cart)
}

func (h *CartHandler) AddToCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var req service.AddToCartRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	cart, err := h.cartService.AddToCart(userID, &req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(cart)
}

func (h *CartHandler) UpdateCartItem(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	itemID, err := strconv.ParseUint(c.Params("item_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid item id"})
	}

	var req service.UpdateCartItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if err := h.cartService.UpdateCartItem(userID, uint(itemID), &req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "item updated"})
}

func (h *CartHandler) RemoveFromCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	itemID, err := strconv.ParseUint(c.Params("item_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid item id"})
	}

	if err := h.cartService.RemoveFromCart(userID, uint(itemID)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "item removed"})
}

func (h *CartHandler) ClearCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	if err := h.cartService.ClearCart(userID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "cart cleared"})
}

