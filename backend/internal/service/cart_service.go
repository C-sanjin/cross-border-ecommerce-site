
package service

import (
	"errors"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type CartService struct {
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
}

func NewCartService(cartRepo *repository.CartRepository, productRepo *repository.ProductRepository) *CartService {
	return &CartService{cartRepo: cartRepo, productRepo: productRepo}
}

type AddToCartRequest struct {
	ProductID uint `json:"product_id" validate:"required"`
	Quantity  int  `json:"quantity" validate:"required,min=1"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" validate:"required,min=1"`
}

func (s *CartService) GetCart(userID uint) (*model.Cart, error) {
	return s.cartRepo.GetCartWithItems(userID)
}

func (s *CartService) AddToCart(userID uint, req *AddToCartRequest) (*model.Cart, error) {
	product, err := s.productRepo.FindByID(req.ProductID)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if product.Stock < req.Quantity {
		return nil, errors.New("insufficient stock")
	}

	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}

	_, err = s.cartRepo.AddItem(cart.ID, req.ProductID, req.Quantity)
	if err != nil {
		return nil, err
	}

	return s.cartRepo.GetCartWithItems(userID)
}

func (s *CartService) UpdateCartItem(userID uint, itemID uint, req *UpdateCartItemRequest) error {
	cart, err := s.cartRepo.GetCartWithItems(userID)
	if err != nil {
		return errors.New("cart not found")
	}

	for _, item := range cart.Items {
		if item.ID == itemID {
			if product, _ := s.productRepo.FindByID(item.ProductID); product != nil {
				if product.Stock < req.Quantity {
					return errors.New("insufficient stock")
				}
			}
			return s.cartRepo.UpdateItem(itemID, req.Quantity)
		}
	}

	return errors.New("item not found in cart")
}

func (s *CartService) RemoveFromCart(userID uint, itemID uint) error {
	cart, err := s.cartRepo.GetCartWithItems(userID)
	if err != nil {
		return errors.New("cart not found")
	}

	for _, item := range cart.Items {
		if item.ID == itemID {
			return s.cartRepo.RemoveItem(itemID)
		}
	}

	return errors.New("item not found in cart")
}

func (s *CartService) ClearCart(userID uint) error {
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return err
	}
	return s.cartRepo.ClearCart(cart.ID)
}

