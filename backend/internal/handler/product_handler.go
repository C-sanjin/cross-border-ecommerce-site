
package handler

import (
	"strconv"
	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
)

type ProductHandler struct {
	productService *service.ProductService
}

func NewProductHandler(productService *service.ProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

func (h *ProductHandler) ListProducts(c *fiber.Ctx) error {
	req := &service.ProductListRequest{
		Page:     1,
		PageSize: 20,
	}

	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			req.Page = p
		}
	}

	if pageSize := c.Query("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			req.PageSize = ps
		}
	}

	req.Keyword = c.Query("keyword")

	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		if id, err := strconv.ParseUint(categoryIDStr, 10, 32); err == nil {
			categoryID := uint(id)
			req.CategoryID = &categoryID
		}
	}

	response, err := h.productService.ListProducts(req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(response)
}

func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
	}

	product, err := h.productService.GetProduct(uint(id))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "product not found"})
	}

	return c.JSON(product)
}

func (h *ProductHandler) GetCategories(c *fiber.Ctx) error {
	categories, err := h.productService.GetCategories()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"categories": categories})
}

