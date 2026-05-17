package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
)

type AddressHandler struct {
	addressService *service.AddressService
}

func NewAddressHandler(addressService *service.AddressService) *AddressHandler {
	return &AddressHandler{addressService: addressService}
}

func (h *AddressHandler) ListAddresses(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	addresses, err := h.addressService.ListAddresses(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"addresses": addresses})
}

func (h *AddressHandler) CreateAddress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var req service.CreateAddressRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}
	addr, err := h.addressService.CreateAddress(userID, &req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(addr)
}

func (h *AddressHandler) UpdateAddress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	addressID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid address id"})
	}
	var req service.CreateAddressRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}
	addr, err := h.addressService.UpdateAddress(userID, uint(addressID), &req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(addr)
}

func (h *AddressHandler) DeleteAddress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	addressID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid address id"})
	}
	if err := h.addressService.DeleteAddress(userID, uint(addressID)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "address deleted"})
}
