package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
)

type PaymentHandler struct {
	paymentService *service.PaymentService
}

func NewPaymentHandler(paymentService *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

func (h *PaymentHandler) CreatePayment(c *fiber.Ctx) error {
	var req service.CreatePaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if req.OrderID == 0 || req.PaymentMethod == "" {
		return c.Status(400).JSON(fiber.Map{"error": "order_id and payment_method are required"})
	}

	result, err := h.paymentService.CreatePayment(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(result)
}

func (h *PaymentHandler) PayPalCallback(c *fiber.Ctx) error {
	paymentID := c.Query("token")
	status := c.Query("status")
	if paymentID == "" || status == "" {
		return c.Status(400).JSON(fiber.Map{"error": "token and status are required"})
	}

	if err := h.paymentService.HandlePayPalCallback(paymentID, status); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "payment processed"})
}

func (h *PaymentHandler) StripeCallback(c *fiber.Ctx) error {
	var body struct {
		PaymentID string `json:"payment_id"`
		Status    string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if err := h.paymentService.HandleStripeCallback(body.PaymentID, body.Status); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "payment processed"})
}

func (h *PaymentHandler) AdminRefundOrder(c *fiber.Ctx) error {
	orderID := c.Params("id")
	if orderID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "order id is required"})
	}

	var id uint
	if _, err := fmt.Sscanf(orderID, "%d", &id); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid order id"})
	}

	if err := h.paymentService.RefundOrder(id); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "order refunded"})
}
