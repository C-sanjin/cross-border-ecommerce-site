package admin

import (
	"errors"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type UserAdminService struct {
	userRepo *repository.UserRepository
}

func NewUserAdminService(userRepo *repository.UserRepository) *UserAdminService {
	return &UserAdminService{userRepo: userRepo}
}

type UserAdminListResponse struct {
	Users      []model.User `json:"users"`
	Total      int64        `json:"total"`
	Page       int          `json:"page"`
	PageSize   int          `json:"page_size"`
	TotalPages int          `json:"total_pages"`
}

func (s *UserAdminService) ListUsers(page, pageSize int, status string) (*UserAdminListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var users []model.User
	var total int64

	query := s.userRepo.DB().Model(&model.User{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users).Error
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &UserAdminListResponse{
		Users:      users,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *UserAdminService) GetUser(id uint) (*model.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *UserAdminService) UpdateUserStatus(id uint, status string) error {
	if status != "active" && status != "banned" {
		return errors.New("invalid status")
	}

	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return errors.New("user not found")
	}

	user.Status = status
	return s.userRepo.Update(user)
}
