
package service

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type ProductService struct {
	productRepo *repository.ProductRepository
}

func NewProductService(productRepo *repository.ProductRepository) *ProductService {
	return &ProductService{productRepo: productRepo}
}

type ProductListRequest struct {
	Page       int     `query:"page"`
	PageSize   int     `query:"page_size"`
	CategoryID *uint   `query:"category_id"`
	Keyword    string  `query:"keyword"`
	SortBy     string  `query:"sort_by"`
	MinPrice   float64 `query:"min_price"`
	MaxPrice   float64 `query:"max_price"`
}

type ProductListResponse struct {
	Products   []model.Product `json:"products"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

func (s *ProductService) ListProducts(req *ProductListRequest) (*ProductListResponse, error) {
	if req.Page < 1 {
		req.Page = 1
	}
	if req.PageSize < 1 || req.PageSize > 100 {
		req.PageSize = 20
	}

	var products []model.Product
	var total int64
	var err error

	if req.Keyword != "" {
		products, total, err = s.productRepo.Search(req.Keyword, req.Page, req.PageSize)
	} else {
		products, total, err = s.productRepo.FindAll(req.Page, req.PageSize, req.CategoryID, req.SortBy, req.MinPrice, req.MaxPrice, "active")
	}

	if err != nil {
		return nil, err
	}

	totalPages := int(total) / req.PageSize
	if int(total)%req.PageSize > 0 {
		totalPages++
	}

	return &ProductListResponse{
		Products:   products,
		Total:      total,
		Page:       req.Page,
		PageSize:   req.PageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *ProductService) GetProduct(id uint) (*model.Product, error) {
	return s.productRepo.FindByID(id)
}

func (s *ProductService) GetCategories() ([]model.ProductCategory, error) {
	return s.productRepo.FindCategories()
}

