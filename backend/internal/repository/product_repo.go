
package repository

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(product *model.Product) error {
	return r.db.Create(product).Error
}

func (r *ProductRepository) FindAll(page, pageSize int, categoryID *uint, sortBy string, minPrice, maxPrice float64, status string) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	query := r.db.Model(&model.Product{}).Where("status = ?", status)

	if categoryID != nil {
		query = query.Where("category_id = ?", *categoryID)
	}

	if minPrice > 0 {
		query = query.Where("price >= ?", minPrice)
	}
	if maxPrice > 0 {
		query = query.Where("price <= ?", maxPrice)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	switch sortBy {
	case "price_asc":
		query = query.Order("price ASC")
	case "price_desc":
		query = query.Order("price DESC")
	case "newest":
		query = query.Order("created_at DESC")
	case "popular":
		query = query.Order("id DESC")
	default:
		query = query.Order("created_at DESC")
	}

	err := query.Offset(offset).Limit(pageSize).Find(&products).Error

	return products, total, err
}

func (r *ProductRepository) FindByID(id uint) (*model.Product, error) {
	var product model.Product
	err := r.db.First(&product, id).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) FindBySKU(sku string) (*model.Product, error) {
	var product model.Product
	err := r.db.Where("sku = ?", sku).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) Search(keyword string, page, pageSize int) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	query := r.db.Model(&model.Product{}).
		Where("status = ? AND (title LIKE ? OR description LIKE ?)", "active", "%"+keyword+"%", "%"+keyword+"%")

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&products).Error

	return products, total, err
}

func (r *ProductRepository) Update(product *model.Product) error {
	return r.db.Save(product).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.db.Delete(&model.Product{}, id).Error
}

func (r *ProductRepository) FindCategories() ([]model.ProductCategory, error) {
	var categories []model.ProductCategory
	err := r.db.Where("status = ?", "active").Order("sort_order ASC").Find(&categories).Error
	return categories, err
}

func (r *ProductRepository) CreateCategory(category *model.ProductCategory) error {
	return r.db.Create(category).Error
}

func (r *ProductRepository) DB() *gorm.DB {
	return r.db
}

