package repository

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(order *model.Order) error {
	return r.db.Create(order).Error
}

func (r *OrderRepository) FindByID(id uint, userID *uint) (*model.Order, error) {
	var order model.Order
	query := r.db.Preload("Items").Where("id = ?", id)
	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}
	err := query.First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) FindByOrderNo(orderNo string, userID *uint) (*model.Order, error) {
	var order model.Order
	query := r.db.Preload("Items").Where("order_no = ?", orderNo)
	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}
	err := query.First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) List(userID uint, page, pageSize int, status string) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64

	query := r.db.Model(&model.Order{}).Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Preload("Items").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders).Error
	if err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (r *OrderRepository) Update(order *model.Order) error {
	return r.db.Save(order).Error
}

func (r *OrderRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&model.Order{}).Where("id = ?", id).Update("status", status).Error
}

func (r *OrderRepository) CreateStatusHistory(history *model.OrderStatusHistory) error {
	return r.db.Create(history).Error
}

func (r *OrderRepository) GetStatusHistory(orderID uint) ([]model.OrderStatusHistory, error) {
	var histories []model.OrderStatusHistory
	err := r.db.Where("order_id = ?", orderID).Order("created_at ASC").Find(&histories).Error
	return histories, err
}

func (r *OrderRepository) AdminList(page, pageSize int, status string) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64

	query := r.db.Model(&model.Order{}).Preload("Items")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders).Error
	if err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}
