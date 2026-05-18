package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type OrderService struct {
	orderRepo     *repository.OrderRepository
	cartRepo      *repository.CartRepository
	productRepo   *repository.ProductRepository
	couponService *CouponService
}

func NewOrderService(orderRepo *repository.OrderRepository, cartRepo *repository.CartRepository, productRepo *repository.ProductRepository, couponService *CouponService) *OrderService {
	return &OrderService{orderRepo: orderRepo, cartRepo: cartRepo, productRepo: productRepo, couponService: couponService}
}

type CreateOrderRequest struct {
	ShippingAddress model.OrderAddress `json:"shipping_address"`
	PaymentMethod   string             `json:"payment_method"`
	Note            string             `json:"note"`
	CouponCode      string             `json:"coupon_code"`
}

type OrderListResponse struct {
	Orders     []model.Order `json:"orders"`
	Total      int64         `json:"total"`
	Page       int           `json:"page"`
	PageSize   int           `json:"page_size"`
	TotalPages int           `json:"total_pages"`
}

func (s *OrderService) CreateOrder(userID uint, req *CreateOrderRequest) (*model.Order, error) {
	cart, err := s.cartRepo.GetCartWithItems(userID)
	if err != nil || len(cart.Items) == 0 {
		return nil, errors.New("cart is empty")
	}

	var totalAmount float64
	var items []model.OrderItem

	for _, cartItem := range cart.Items {
		product, err := s.productRepo.FindByID(cartItem.ProductID)
		if err != nil {
			return nil, errors.New("product not found: " + fmt.Sprintf("%d", cartItem.ProductID))
		}

		if product.Stock < cartItem.Quantity {
			return nil, errors.New("insufficient stock for product: " + product.Title)
		}

		subtotal := product.Price * float64(cartItem.Quantity)
		totalAmount += subtotal

		items = append(items, model.OrderItem{
			ProductID:    cartItem.ProductID,
			ProductTitle: product.Title,
			Price:        product.Price,
			Quantity:     cartItem.Quantity,
			Subtotal:     subtotal,
			ImageURL:     "",
		})

		product.Stock -= cartItem.Quantity
		if err := s.productRepo.Update(product); err != nil {
			return nil, errors.New("failed to update product stock")
		}
	}

	var discountAmount float64
	if req.CouponCode != "" {
		couponResp, err := s.couponService.ValidateCoupon(&ValidateCouponRequest{
			Code:        req.CouponCode,
			OrderAmount: totalAmount,
		})
		if err == nil && couponResp.IsValid {
			discountAmount = couponResp.DiscountAmount
			totalAmount -= discountAmount
			if err := s.couponService.ApplyCoupon(couponResp.Coupon.ID); err != nil {
				return nil, errors.New("failed to apply coupon")
			}
		}
	}

	shippingFee := 0.0
	if totalAmount < 100 {
		shippingFee = 15.0
	}
	totalAmount += shippingFee

	orderNo := fmt.Sprintf("ORD-%d-%s", time.Now().Unix(), fmt.Sprintf("%04d", userID))

	addr := req.ShippingAddress
	order := &model.Order{
		OrderNo:         orderNo,
		UserID:          userID,
		Status:          "pending",
		TotalAmount:     totalAmount,
		DiscountAmount:  discountAmount,
		ShippingFee:     shippingFee,
		PaymentMethod:   req.PaymentMethod,
		ShippingName:    addr.Name,
		ShippingPhone:   addr.Phone,
		ShippingCountry: addr.Country,
		ShippingState:   addr.State,
		ShippingCity:    addr.City,
		ShippingStreet:  addr.Street,
		ShippingZipCode: addr.ZipCode,
		Note:            req.Note,
		Items:           items,
	}

	if err := s.orderRepo.Create(order); err != nil {
		return nil, err
	}

	s.cartRepo.ClearCart(cart.ID)

	s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
		OrderID: order.ID,
		Status:  "pending",
		Note:    "Order created",
	})

	return s.orderRepo.FindByID(order.ID, nil)
}

func (s *OrderService) GetOrder(orderID uint, userID uint) (*model.Order, error) {
	return s.orderRepo.FindByID(orderID, &userID)
}

func (s *OrderService) ListOrders(userID uint, page, pageSize int, status string) (*OrderListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	orders, total, err := s.orderRepo.List(userID, page, pageSize, status)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &OrderListResponse{
		Orders:     orders,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *OrderService) CancelOrder(orderID uint, userID uint) error {
	order, err := s.orderRepo.FindByID(orderID, &userID)
	if err != nil {
		return errors.New("order not found")
	}

	if order.Status != "pending" {
		return errors.New("only pending orders can be cancelled")
	}

	order.Status = "cancelled"
	if err := s.orderRepo.Update(order); err != nil {
		return err
	}

	s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
		OrderID: orderID,
		Status:  "cancelled",
		Note:    "Order cancelled by user",
	})

	return nil
}

func (s *OrderService) AdminListOrders(page, pageSize int, status string) (*OrderListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	orders, total, err := s.orderRepo.AdminList(page, pageSize, status)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &OrderListResponse{
		Orders:     orders,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *OrderService) AdminGetOrder(orderID uint) (*model.Order, error) {
	return s.orderRepo.FindByID(orderID, nil)
}

func (s *OrderService) AdminUpdateOrderStatus(orderID uint, newStatus string) error {
	validStatuses := map[string]bool{
		"pending": true, "paid": true, "processing": true,
		"shipped": true, "delivered": true, "cancelled": true, "refunded": true,
	}
	if !validStatuses[newStatus] {
		return errors.New("invalid status")
	}

	order, err := s.orderRepo.FindByID(orderID, nil)
	if err != nil {
		return errors.New("order not found")
	}

	order.Status = newStatus
	if err := s.orderRepo.Update(order); err != nil {
		return err
	}

	s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
		OrderID: orderID,
		Status:  newStatus,
		Note:    "Status updated by admin",
	})

	return nil
}

func (s *OrderService) GetStatusHistory(orderID uint) ([]model.OrderStatusHistory, error) {
	return s.orderRepo.GetStatusHistory(orderID)
}
