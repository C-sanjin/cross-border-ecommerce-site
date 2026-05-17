package service

import (
	"errors"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type ReviewService struct {
	reviewRepo *repository.ReviewRepository
	userRepo   *repository.UserRepository
}

func NewReviewService(reviewRepo *repository.ReviewRepository, userRepo *repository.UserRepository) *ReviewService {
	return &ReviewService{reviewRepo: reviewRepo, userRepo: userRepo}
}

type CreateReviewRequest struct {
	ProductID uint   `json:"product_id"`
	Rating    int    `json:"rating"`
	Title     string `json:"title"`
	Content   string `json:"content"`
}

type ReviewListResponse struct {
	Reviews []model.ProductReview `json:"reviews"`
	Total   int64                 `json:"total"`
	AvgRating float64             `json:"avg_rating"`
}

func (s *ReviewService) ListReviews(productID uint, page, pageSize int) (*ReviewListResponse, error) {
	reviews, total, err := s.reviewRepo.FindByProductID(productID, page, pageSize)
	if err != nil {
		return nil, err
	}
	avg, _, _ := s.reviewRepo.GetAvgRating(productID)
	return &ReviewListResponse{
		Reviews:   reviews,
		Total:     total,
		AvgRating: avg,
	}, nil
}

func (s *ReviewService) CreateReview(userID uint, req *CreateReviewRequest) (*model.ProductReview, error) {
	if req.Rating < 1 || req.Rating > 5 {
		return nil, errors.New("rating must be between 1 and 5")
	}
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	review := &model.ProductReview{
		ProductID: req.ProductID,
		UserID:    userID,
		UserName:  user.Name,
		Rating:    req.Rating,
		Title:     req.Title,
		Content:   req.Content,
	}
	if err := s.reviewRepo.Create(review); err != nil {
		return nil, err
	}
	return review, nil
}
