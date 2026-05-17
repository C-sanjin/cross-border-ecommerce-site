package service

import (
	"errors"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type CouponService struct {
	couponRepo *repository.CouponRepository
}

func NewCouponService(couponRepo *repository.CouponRepository) *CouponService {
	return &CouponService{couponRepo: couponRepo}
}

type ValidateCouponRequest struct {
	Code          string  `json:"code"`
	OrderAmount   float64 `json:"order_amount"`
}

type CouponResponse struct {
	Coupon         *model.Coupon `json:"coupon"`
	DiscountAmount float64       `json:"discount_amount"`
	IsValid        bool          `json:"is_valid"`
	Message        string        `json:"message"`
}

func (s *CouponService) ValidateCoupon(req *ValidateCouponRequest) (*CouponResponse, error) {
	coupon, err := s.couponRepo.FindByCode(req.Code)
	if err != nil {
		return &CouponResponse{IsValid: false, Message: "Invalid coupon code"}, nil
	}
	if !s.couponRepo.IsValid(coupon) {
		return &CouponResponse{IsValid: false, Message: "Coupon has expired or reached usage limit"}, nil
	}
	if coupon.MinOrderAmount > 0 && req.OrderAmount < coupon.MinOrderAmount {
		return &CouponResponse{
			IsValid: false,
			Message: "Order amount does not meet minimum requirement",
			Coupon:  coupon,
		}, nil
	}
	var discount float64
	if coupon.Type == "percent" {
		discount = req.OrderAmount * (coupon.Value / 100)
		if coupon.MaxDiscount > 0 && discount > coupon.MaxDiscount {
			discount = coupon.MaxDiscount
		}
	} else {
		discount = coupon.Value
	}
	if discount > req.OrderAmount {
		discount = req.OrderAmount
	}
	return &CouponResponse{
		Coupon:         coupon,
		DiscountAmount: discount,
		IsValid:        true,
		Message:        "Coupon applied successfully",
	}, nil
}

func (s *CouponService) ApplyCoupon(couponID uint) error {
	return s.couponRepo.IncrementUsage(couponID)
}

func (s *CouponService) ListCoupons(page, pageSize int) ([]model.Coupon, int64, error) {
	return s.couponRepo.FindAll(page, pageSize)
}

func (s *CouponService) CreateCoupon(coupon *model.Coupon) error {
	if coupon.Code == "" {
		return errors.New("coupon code is required")
	}
	return s.couponRepo.Create(coupon)
}
