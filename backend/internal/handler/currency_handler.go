package handler

import (
	"github.com/gofiber/fiber/v2"
)

type CurrencyHandler struct{}

func NewCurrencyHandler() *CurrencyHandler {
	return &CurrencyHandler{}
}

type CurrencyRateResponse struct {
	Code   string  `json:"code"`
	Name   string  `json:"name"`
	Symbol string  `json:"symbol"`
	Rate   float64 `json:"rate"`
}

var defaultRates = []CurrencyRateResponse{
	{Code: "USD", Name: "US Dollar", Symbol: "$", Rate: 1},
	{Code: "EUR", Name: "Euro", Symbol: "€", Rate: 0.92},
	{Code: "GBP", Name: "British Pound", Symbol: "£", Rate: 0.79},
	{Code: "JPY", Name: "Japanese Yen", Symbol: "¥", Rate: 149.5},
	{Code: "CNY", Name: "Chinese Yuan", Symbol: "¥", Rate: 7.24},
	{Code: "KRW", Name: "Korean Won", Symbol: "₩", Rate: 1345.0},
}

func (h *CurrencyHandler) GetRates(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"rates": defaultRates})
}

func (h *CurrencyHandler) Convert(c *fiber.Ctx) error {
	from := c.Query("from", "USD")
	to := c.Query("to", "USD")
	amount := c.QueryFloat("amount", 0)

	if amount == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "amount is required"})
	}

	var fromRate, toRate float64 = 1, 1
	for _, r := range defaultRates {
		if r.Code == from {
			fromRate = r.Rate
		}
		if r.Code == to {
			toRate = r.Rate
		}
	}

	usdAmount := amount / fromRate
	converted := usdAmount * toRate

	return c.JSON(fiber.Map{
		"from":       from,
		"to":         to,
		"amount":     amount,
		"converted":  converted,
		"rate":       toRate / fromRate,
	})
}
