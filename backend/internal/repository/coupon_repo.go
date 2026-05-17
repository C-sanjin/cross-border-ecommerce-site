package repository

import (
	"time"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"gorm.io/gorm"
)

type CouponRepository struct {
	db *gorm.DB
}

func NewCouponRepository(db *gorm.DB) *CouponRepository {
	return &CouponRepository{db: db}
}

func (r *CouponRepository) FindByCode(code string) (*model.Coupon, error) {
	var coupon model.Coupon
	err := r.db.Where("code = ? AND status = ?", code, "active").First(&coupon).Error
	if err != nil {
		return nil, err
	}
	return &coupon, nil
}

func (r *CouponRepository) IsValid(coupon *model.Coupon) bool {
	now := time.Now().Unix()
	if coupon.StartsAt > 0 && now < coupon.StartsAt {
		return false
	}
	if coupon.ExpiresAt > 0 && now > coupon.ExpiresAt {
		return false
	}
	if coupon.UsageLimit > 0 && coupon.UsageCount >= coupon.UsageLimit {
		return false
	}
	return true
}

func (r *CouponRepository) IncrementUsage(id uint) error {
	return r.db.Model(&model.Coupon{}).Where("id = ?", id).UpdateColumn("usage_count", gorm.Expr("usage_count + 1")).Error
}

func (r *CouponRepository) FindAll(page, pageSize int) ([]model.Coupon, int64, error) {
	var coupons []model.Coupon
	var total int64
	r.db.Model(&model.Coupon{}).Count(&total)
	offset := (page - 1) * pageSize
	err := r.db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&coupons).Error
	return coupons, total, err
}

func (r *CouponRepository) Create(coupon *model.Coupon) error {
	return r.db.Create(coupon).Error
}
