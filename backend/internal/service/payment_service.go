package service

import (
	"errors"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type PaymentService struct {
	orderRepo *repository.OrderRepository
}

func NewPaymentService(orderRepo *repository.OrderRepository) *PaymentService {
	return &PaymentService{orderRepo: orderRepo}
}

type CreatePaymentRequest struct {
	OrderID       uint    `json:"order_id"`
	PaymentMethod string  `json:"payment_method"` // paypal, stripe
}

type PaymentResponse struct {
	PaymentID   string  `json:"payment_id"`
	Status      string  `json:"status"`
	RedirectURL string  `json:"redirect_url"`
}

func (s *PaymentService) CreatePayment(req *CreatePaymentRequest) (*PaymentResponse, error) {
	order, err := s.orderRepo.FindByID(req.OrderID, nil)
	if err != nil {
		return nil, errors.New("order not found")
	}

	if order.Status != "pending" {
		return nil, errors.New("order is not in pending status")
	}

	switch req.PaymentMethod {
	case "paypal":
		return s.createPayPalPayment(order)
	case "stripe":
		return s.createStripePayment(order)
	default:
		return nil, errors.New("unsupported payment method")
	}
}

func (s *PaymentService) createPayPalPayment(order *model.Order) (*PaymentResponse, error) {
	paymentID := "PP-" + order.OrderNo

	order.PaymentMethod = "paypal"
	order.PaymentID = paymentID
	order.PaymentStatus = "pending"
	s.orderRepo.Update(order)

	s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
		OrderID: order.ID,
		Status:  "paid",
		Note:    "PayPal payment initiated",
	})

	return &PaymentResponse{
		PaymentID:   paymentID,
		Status:      "pending",
		RedirectURL: "https://www.paypal.com/checkoutnow?token=" + paymentID,
	}, nil
}

func (s *PaymentService) createStripePayment(order *model.Order) (*PaymentResponse, error) {
	paymentID := "STRIPE-" + order.OrderNo

	order.PaymentMethod = "stripe"
	order.PaymentID = paymentID
	order.PaymentStatus = "pending"
	s.orderRepo.Update(order)

	s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
		OrderID: order.ID,
		Status:  "paid",
		Note:    "Stripe payment initiated",
	})

	return &PaymentResponse{
		PaymentID:   paymentID,
		Status:      "pending",
		RedirectURL: "https://checkout.stripe.com/pay/" + paymentID,
	}, nil
}

func (s *PaymentService) HandlePayPalCallback(paymentID string, status string) error {
	return s.handlePaymentCallback(paymentID, status)
}

func (s *PaymentService) HandleStripeCallback(paymentID string, status string) error {
	return s.handlePaymentCallback(paymentID, status)
}

func (s *PaymentService) handlePaymentCallback(paymentID string, status string) error {
	order, err := s.orderRepo.FindByOrderNo(paymentID[3:], nil)
	if err != nil {
		return errors.New("order not found for payment: " + paymentID)
	}

	switch status {
	case "completed", "succeeded":
		order.PaymentStatus = "completed"
		order.Status = "paid"
		s.orderRepo.Update(order)
		s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
			OrderID: order.ID,
			Status:  "paid",
			Note:    "Payment completed via callback",
		})
	case "failed", "cancelled":
		order.PaymentStatus = "failed"
		s.orderRepo.Update(order)
		s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
			OrderID: order.ID,
			Status:  "cancelled",
			Note:    "Payment failed via callback",
		})
	}

	return nil
}

func (s *PaymentService) RefundOrder(orderID uint) error {
	order, err := s.orderRepo.FindByID(orderID, nil)
	if err != nil {
		return errors.New("order not found")
	}

	if order.Status != "paid" && order.Status != "delivered" {
		return errors.New("only paid or delivered orders can be refunded")
	}

	order.Status = "refunded"
	order.PaymentStatus = "refunded"
	if err := s.orderRepo.Update(order); err != nil {
		return err
	}

	s.orderRepo.CreateStatusHistory(&model.OrderStatusHistory{
		OrderID: orderID,
		Status:  "refunded",
		Note:    "Order refunded by admin",
	})

	return nil
}
