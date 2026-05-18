
package service

import (
	"errors"
	"time"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/config"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type AuthService struct {
	userRepo *repository.UserRepository
	db       *gorm.DB
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, db: db, cfg: cfg}
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	User         *model.User `json:"user"`
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
}

func (s *AuthService) Register(req *RegisterRequest) (*AuthResponse, error) {
	existing, _ := s.userRepo.FindByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("email already exists")
	}
	
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	
	user := &model.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
		Status:   "active",
	}
	
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	
	return s.generateToken(user, "user")
}

func (s *AuthService) Login(req *LoginRequest) (*AuthResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}
	
	role := s.getAdminRole(req.Email)
	if role == "" {
		role = "user"
	}
	
	return s.generateToken(user, role)
}

func (s *AuthService) getAdminRole(email string) string {
	var role string
	s.db.Table("admin_users").Where("email = ? AND status = ?", email, "active").Select("role").Scan(&role)
	return role
}

func (s *AuthService) generateToken(user *model.User, role string) (*AuthResponse, error) {
	if role == "" {
		role = "user"
	}
	
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    role,
		"exp":     time.Now().Add(time.Minute * time.Duration(s.cfg.JWT.AccessExpiry)).Unix(),
	})
	
	accessTokenString, err := accessToken.SignedString([]byte(s.cfg.JWT.Secret))
	if err != nil {
		return nil, err
	}
	
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    role,
		"type":    "refresh",
		"exp":     time.Now().Add(time.Minute * time.Duration(s.cfg.JWT.RefreshExpiry)).Unix(),
	})
	
	refreshTokenString, err := refreshToken.SignedString([]byte(s.cfg.JWT.Secret))
	if err != nil {
		return nil, err
	}
	
	return &AuthResponse{
		User:         user,
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWT.Secret), nil
	})
	
	if err != nil {
		return nil, err
	}
	
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &claims, nil
	}
	
	return nil, errors.New("invalid token")
}

func (s *AuthService) GetUserByID(id uint) (*model.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *AuthService) RefreshAccessToken(refreshToken string) (*AuthResponse, error) {
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	userID := uint((*claims)["user_id"].(float64))
	user, err := s.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	role, _ := (*claims)["role"].(string)
	if role == "" {
		role = "user"
	}

	return s.generateToken(user, role)
}
