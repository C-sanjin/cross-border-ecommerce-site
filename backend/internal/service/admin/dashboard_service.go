package admin

import (
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
	"gorm.io/gorm"
)

type DashboardService struct {
	db          *gorm.DB
	orderRepo   *repository.OrderRepository
	productRepo *repository.ProductRepository
	userRepo    *repository.UserRepository
}

func NewDashboardService(db *gorm.DB, orderRepo *repository.OrderRepository, productRepo *repository.ProductRepository, userRepo *repository.UserRepository) *DashboardService {
	return &DashboardService{db: db, orderRepo: orderRepo, productRepo: productRepo, userRepo: userRepo}
}

type DashboardStats struct {
	TotalRevenue     float64 `json:"total_revenue"`
	TotalOrders      int64   `json:"total_orders"`
	TotalUsers       int64   `json:"total_users"`
	TotalProducts    int64   `json:"total_products"`
	TodayOrders      int64   `json:"today_orders"`
	TodayRevenue     float64 `json:"today_revenue"`
	PendingOrders    int64   `json:"pending_orders"`
	LowStockProducts int64   `json:"low_stock_products"`
}

type OrderStatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type TopProduct struct {
	ProductID   uint    `json:"product_id"`
	ProductTitle string `json:"product_title"`
	TotalSold   int     `json:"total_sold"`
	TotalRevenue float64 `json:"total_revenue"`
}

func (s *DashboardService) GetStats() (*DashboardStats, error) {
	stats := &DashboardStats{}

	s.db.Model(&model.Order{}).Where("status IN ('paid', 'processing', 'shipped', 'delivered')").Select("SUM(total_amount)").Row().Scan(&stats.TotalRevenue)

	s.db.Model(&model.Order{}).Count(&stats.TotalOrders)

	s.db.Model(&model.User{}).Count(&stats.TotalUsers)

	s.db.Model(&model.Product{}).Count(&stats.TotalProducts)

	s.db.Model(&model.Order{}).Where("status = ?", "pending").Count(&stats.PendingOrders)

	s.db.Model(&model.Product{}).Where("stock < ?", 10).Count(&stats.LowStockProducts)

	return stats, nil
}

func (s *DashboardService) GetOrderStatusCounts() ([]OrderStatusCount, error) {
	var counts []OrderStatusCount

	statuses := []string{"pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"}
	for _, status := range statuses {
		var count int64
		s.db.Model(&model.Order{}).Where("status = ?", status).Count(&count)
		if count > 0 {
			counts = append(counts, OrderStatusCount{Status: status, Count: count})
		}
	}

	return counts, nil
}

func (s *DashboardService) GetTopProducts(limit int) ([]TopProduct, error) {
	var topProducts []TopProduct

	s.db.Model(&model.OrderItem{}).
		Select("product_id, product_title, SUM(quantity) as total_sold, SUM(subtotal) as total_revenue").
		Group("product_id, product_title").
		Order("total_sold DESC").
		Limit(limit).
		Scan(&topProducts)

	return topProducts, nil
}
