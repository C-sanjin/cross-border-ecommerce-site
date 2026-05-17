package repository

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"gorm.io/gorm"
)

type AddressRepository struct {
	db *gorm.DB
}

func NewAddressRepository(db *gorm.DB) *AddressRepository {
	return &AddressRepository{db: db}
}

func (r *AddressRepository) FindByUserID(userID uint) ([]model.UserAddress, error) {
	var addresses []model.UserAddress
	err := r.db.Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses).Error
	return addresses, err
}

func (r *AddressRepository) FindByID(id uint) (*model.UserAddress, error) {
	var addr model.UserAddress
	err := r.db.First(&addr, id).Error
	if err != nil {
		return nil, err
	}
	return &addr, nil
}

func (r *AddressRepository) Create(addr *model.UserAddress) error {
	return r.db.Create(addr).Error
}

func (r *AddressRepository) Update(addr *model.UserAddress) error {
	return r.db.Save(addr).Error
}

func (r *AddressRepository) Delete(id uint) error {
	return r.db.Delete(&model.UserAddress{}, id).Error
}

func (r *AddressRepository) ClearDefault(userID uint) error {
	return r.db.Model(&model.UserAddress{}).Where("user_id = ? AND is_default = ?", userID, true).Update("is_default", false).Error
}
