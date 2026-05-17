package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service/admin"
)

type ProductAdminHandler struct {
	productService *admin.ProductAdminService
}

func NewProductAdminHandler(productService *admin.ProductAdminService) *ProductAdminHandler {
	return &ProductAdminHandler{productService: productService}
}

func (h *ProductAdminHandler) ListProducts(c *fiber.Ctx) error {
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

	result, err := h.productService.ListProducts(page, pageSize, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(result)
}

func (h *ProductAdminHandler) GetProduct(c *fiber.Ctx) error {
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

func (h *ProductAdminHandler) CreateProduct(c *fiber.Ctx) error {
	var req admin.CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	product, err := h.productService.CreateProduct(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(product)
}

func (h *ProductAdminHandler) UpdateProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
	}

	var req admin.CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	product, err := h.productService.UpdateProduct(uint(id), &req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(product)
}

func (h *ProductAdminHandler) DeleteProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
	}

	if err := h.productService.DeleteProduct(uint(id)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "product deleted"})
}

func (h *ProductAdminHandler) ListCategories(c *fiber.Ctx) error {
	categories, err := h.productService.ListCategories()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"categories": categories})
}

func (h *ProductAdminHandler) CreateCategory(c *fiber.Ctx) error {
	var body struct {
		Name     string `json:"name"`
		ParentID *uint  `json:"parent_id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if body.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name is required"})
	}

	cat, err := h.productService.CreateCategory(body.Name, body.ParentID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(cat)
}
