package admin

import (
	"errors"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AdminUserAdminService struct {
	adminUserRepo *repository.AdminUserRepository
}

func NewAdminUserAdminService(adminUserRepo *repository.AdminUserRepository) *AdminUserAdminService {
	return &AdminUserAdminService{adminUserRepo: adminUserRepo}
}

type AdminUserListResponse struct {
	Users      []model.AdminUser `json:"users"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

type CreateAdminUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

func (s *AdminUserAdminService) ListAdminUsers(page, pageSize int, status string) (*AdminUserListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var users []model.AdminUser
	var total int64

	query := s.adminUserRepo.DB().Model(&model.AdminUser{})
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

	return &AdminUserListResponse{
		Users:      users,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *AdminUserAdminService) GetAdminUser(id uint) (*model.AdminUser, error) {
	return s.adminUserRepo.FindByID(id)
}

func (s *AdminUserAdminService) CreateAdminUser(req *CreateAdminUserRequest) (*model.AdminUser, error) {
	if req.Username == "" || req.Email == "" || req.Password == "" {
		return nil, errors.New("username, email and password are required")
	}

	existing, _ := s.adminUserRepo.FindByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("email already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	role := req.Role
	if role == "" {
		role = "operator"
	}
	validRoles := map[string]bool{"super_admin": true, "product_admin": true, "customer_service": true, "finance": true, "operator": true}
	if !validRoles[role] {
		return nil, errors.New("invalid role")
	}

	user := &model.AdminUser{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
		Role:     role,
		Status:   "active",
	}

	if err := s.adminUserRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AdminUserAdminService) UpdateAdminUserStatus(id uint, status string) error {
	if status != "active" && status != "inactive" {
		return errors.New("invalid status")
	}

	user, err := s.adminUserRepo.FindByID(id)
	if err != nil {
		return errors.New("admin user not found")
	}

	if user.Role == "super_admin" && status == "inactive" {
		return errors.New("cannot deactivate super admin")
	}

	user.Status = status
	return s.adminUserRepo.Update(user)
}

func (s *AdminUserAdminService) DeleteAdminUser(id uint, currentUserID uint) error {
	if id == currentUserID {
		return errors.New("cannot delete yourself")
	}

	user, err := s.adminUserRepo.FindByID(id)
	if err != nil {
		return errors.New("admin user not found")
	}

	if user.Role == "super_admin" {
		return errors.New("cannot delete super admin")
	}

	return s.adminUserRepo.Delete(id)
}