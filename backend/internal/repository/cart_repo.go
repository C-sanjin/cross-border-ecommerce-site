
package repository

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"gorm.io/gorm"
)

type CartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) GetOrCreateCart(userID uint) (*model.Cart, error) {
	var cart model.Cart
	err := r.db.Where("user_id = ?", userID).First(&cart).Error

	if err == gorm.ErrRecordNotFound {
		cart = model.Cart{UserID: userID}
		if err := r.db.Create(&cart).Error; err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	return &cart, nil
}

func (r *CartRepository) GetCartWithItems(userID uint) (*model.Cart, error) {
	var cart model.Cart
	err := r.db.Preload("Items.Product").Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		return nil, err
	}
	return &cart, nil
}

func (r *CartRepository) AddItem(cartID, productID uint, quantity int) (*model.CartItem, error) {
	var existingItem model.CartItem
	err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&existingItem).Error

	if err == nil {
		existingItem.Quantity += quantity
		if err := r.db.Save(&existingItem).Error; err != nil {
			return nil, err
		}
		return &existingItem, nil
	}

	if err == gorm.ErrRecordNotFound {
		item := &model.CartItem{
			CartID:    cartID,
			ProductID: productID,
			Quantity:  quantity,
		}
		if err := r.db.Create(item).Error; err != nil {
			return nil, err
		}
		return item, nil
	}

	return nil, err
}

func (r *CartRepository) UpdateItem(itemID uint, quantity int) error {
	return r.db.Model(&model.CartItem{}).Where("id = ?", itemID).Update("quantity", quantity).Error
}

func (r *CartRepository) RemoveItem(itemID uint) error {
	return r.db.Delete(&model.CartItem{}, itemID).Error
}

func (r *CartRepository) ClearCart(cartID uint) error {
	return r.db.Where("cart_id = ?", cartID).Delete(&model.CartItem{}).Error
}

