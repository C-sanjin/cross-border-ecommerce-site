package repository

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"gorm.io/gorm"
)

type AdminUserRepository struct {
	db *gorm.DB
}

func NewAdminUserRepository(db *gorm.DB) *AdminUserRepository {
	return &AdminUserRepository{db: db}
}

func (r *AdminUserRepository) FindByID(id uint) (*model.AdminUser, error) {
	var user model.AdminUser
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AdminUserRepository) FindByEmail(email string) (*model.AdminUser, error) {
	var user model.AdminUser
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AdminUserRepository) Create(user *model.AdminUser) error {
	return r.db.Create(user).Error
}

func (r *AdminUserRepository) Update(user *model.AdminUser) error {
	return r.db.Save(user).Error
}

func (r *AdminUserRepository) Delete(id uint) error {
	return r.db.Delete(&model.AdminUser{}, id).Error
}

func (r *AdminUserRepository) DB() *gorm.DB {
	return r.db
}