package repository

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"gorm.io/gorm"
)

type ReviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) *ReviewRepository {
	return &ReviewRepository{db: db}
}

func (r *ReviewRepository) FindByProductID(productID uint, page, pageSize int) ([]model.ProductReview, int64, error) {
	var reviews []model.ProductReview
	var total int64
	r.db.Where("product_id = ?", productID).Model(&model.ProductReview{}).Count(&total)
	offset := (page - 1) * pageSize
	err := r.db.Where("product_id = ?", productID).Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&reviews).Error
	return reviews, total, err
}

func (r *ReviewRepository) Create(review *model.ProductReview) error {
	return r.db.Create(review).Error
}

func (r *ReviewRepository) GetAvgRating(productID uint) (float64, int64, error) {
	var avg float64
	var count int64
	r.db.Where("product_id = ?", productID).Model(&model.ProductReview{}).Count(&count)
	if count == 0 {
		return 0, 0, nil
	}
	r.db.Model(&model.ProductReview{}).Where("product_id = ?", productID).Select("AVG(rating)").Scan(&avg)
	return avg, count, nil
}
