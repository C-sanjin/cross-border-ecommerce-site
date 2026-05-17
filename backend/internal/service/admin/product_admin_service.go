package admin

import (
	"errors"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type ProductAdminService struct {
	productRepo *repository.ProductRepository
}

func NewProductAdminService(productRepo *repository.ProductRepository) *ProductAdminService {
	return &ProductAdminService{productRepo: productRepo}
}

type ProductAdminListResponse struct {
	Products   []model.Product `json:"products"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

func (s *ProductAdminService) ListProducts(page, pageSize int, status string) (*ProductAdminListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var products []model.Product
	var total int64

	query := s.productRepo.DB().Model(&model.Product{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&products).Error
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &ProductAdminListResponse{
		Products:   products,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *ProductAdminService) GetProduct(id uint) (*model.Product, error) {
	return s.productRepo.FindByID(id)
}

type CreateProductRequest struct {
	Title        string  `json:"title"`
	Slug         string  `json:"slug"`
	Description  string  `json:"description"`
	ShortDesc    string  `json:"short_desc"`
	CategoryID   uint    `json:"category_id"`
	Price        float64 `json:"price"`
	ComparePrice float64 `json:"compare_price"`
	Stock        int     `json:"stock"`
	Weight       float64 `json:"weight"`
	Images       string  `json:"images"`
	Status       string  `json:"status"`
	IsFeatured   bool    `json:"is_featured"`
	MetaTitle    string  `json:"meta_title"`
	MetaDesc     string  `json:"meta_desc"`
}

func (s *ProductAdminService) CreateProduct(req *CreateProductRequest) (*model.Product, error) {
	product := &model.Product{
		Title:        req.Title,
		Slug:         req.Slug,
		Description:  req.Description,
		ShortDesc:    req.ShortDesc,
		CategoryID:   req.CategoryID,
		Price:        req.Price,
		ComparePrice: req.ComparePrice,
		Stock:        req.Stock,
		Weight:       req.Weight,
		Images:       req.Images,
		Status:       req.Status,
		IsFeatured:   req.IsFeatured,
		MetaTitle:    req.MetaTitle,
		MetaDesc:     req.MetaDesc,
	}

	if product.Status == "" {
		product.Status = "draft"
	}

	if err := s.productRepo.Create(product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductAdminService) UpdateProduct(id uint, req *CreateProductRequest) (*model.Product, error) {
	product, err := s.productRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("product not found")
	}

	product.Title = req.Title
	product.Slug = req.Slug
	product.Description = req.Description
	product.ShortDesc = req.ShortDesc
	product.CategoryID = req.CategoryID
	product.Price = req.Price
	product.ComparePrice = req.ComparePrice
	product.Stock = req.Stock
	product.Weight = req.Weight
	product.Images = req.Images
	product.Status = req.Status
	product.IsFeatured = req.IsFeatured
	product.MetaTitle = req.MetaTitle
	product.MetaDesc = req.MetaDesc

	if err := s.productRepo.Update(product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductAdminService) DeleteProduct(id uint) error {
	product, err := s.productRepo.FindByID(id)
	if err != nil {
		return errors.New("product not found")
	}
	product.Status = "inactive"
	return s.productRepo.Update(product)
}

func (s *ProductAdminService) ListCategories() ([]model.ProductCategory, error) {
	return s.productRepo.FindCategories()
}

func (s *ProductAdminService) CreateCategory(name string, parentID *uint) (*model.ProductCategory, error) {
	cat := &model.ProductCategory{
		Name:      name,
		ParentID:  parentID,
		SortOrder: 0,
		Status:    "active",
	}
	if err := s.productRepo.DB().Create(cat).Error; err != nil {
		return nil, err
	}
	return cat, nil
}
