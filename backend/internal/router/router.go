package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/config"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/handler"
	adminhandler "github.com/C-sanjin/cross-border-ecommerce/backend/internal/handler/admin"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/middleware"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/service"
	adminservice "github.com/C-sanjin/cross-border-ecommerce/backend/internal/service/admin"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
	"gorm.io/gorm"
)

func Setup(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	// Initialize repositories, services and handlers
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, db, cfg)
	authHandler := handler.NewAuthHandler(authService)
	
	productRepo := repository.NewProductRepository(db)
	productService := service.NewProductService(productRepo)
	productHandler := handler.NewProductHandler(productService)
	
	cartRepo := repository.NewCartRepository(db)
	cartService := service.NewCartService(cartRepo, productRepo)
	cartHandler := handler.NewCartHandler(cartService)

	couponRepo := repository.NewCouponRepository(db)
	couponService := service.NewCouponService(couponRepo)
	couponHandler := handler.NewCouponHandler(couponService)

	orderRepo := repository.NewOrderRepository(db)
	orderService := service.NewOrderService(orderRepo, cartRepo, productRepo, couponService)
	orderHandler := handler.NewOrderHandler(orderService)

	reviewRepo := repository.NewReviewRepository(db)
	reviewService := service.NewReviewService(reviewRepo, userRepo)
	reviewHandler := handler.NewReviewHandler(reviewService)

	addressRepo := repository.NewAddressRepository(db)
	addressService := service.NewAddressService(addressRepo)
	addressHandler := handler.NewAddressHandler(addressService)

	api := app.Group("/api/v1")

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.RefreshToken)

	// Product public routes
	api.Get("/products", productHandler.ListProducts)
	api.Get("/products/:id", productHandler.GetProduct)
	api.Get("/categories", productHandler.GetCategories)
	api.Get("/products/:product_id/reviews", reviewHandler.ListReviews)

	// Coupon public routes
	api.Get("/coupons", couponHandler.ListCoupons)
	api.Post("/coupons/validate", couponHandler.ValidateCoupon)

	// Currency routes
	currencyHandler := handler.NewCurrencyHandler()
	api.Get("/currency/rates", currencyHandler.GetRates)
	api.Get("/currency/convert", currencyHandler.Convert)

	// Protected routes
	protected := api.Group("/", middleware.AuthMiddleware(authService))
	protected.Get("/profile", func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(uint)
		user, err := authService.GetUserByID(userID)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "user not found"})
		}
		return c.JSON(user)
	})
	protected.Put("/profile", func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(uint)
		user, err := authService.GetUserByID(userID)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "user not found"})
		}
		var body struct {
			Name  string `json:"name"`
			Phone string `json:"phone"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		if body.Name != "" {
			user.Name = body.Name
		}
		if body.Phone != "" {
			user.Phone = body.Phone
		}
		if err := userRepo.Update(user); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to update profile"})
		}
		return c.JSON(user)
	})

	// Cart routes (protected)
	cart := protected.Group("/cart")
	cart.Get("/", cartHandler.GetCart)
	cart.Post("/items", cartHandler.AddToCart)
	cart.Put("/items/:item_id", cartHandler.UpdateCartItem)
	cart.Delete("/items/:item_id", cartHandler.RemoveFromCart)
	cart.Delete("/", cartHandler.ClearCart)

	// Order routes (protected)
	orders := protected.Group("/orders")
	orders.Post("/", orderHandler.CreateOrder)
	orders.Get("/", orderHandler.ListOrders)
	orders.Get("/:id", orderHandler.GetOrder)
	orders.Post("/:id/cancel", orderHandler.CancelOrder)
	orders.Get("/:id/history", orderHandler.GetStatusHistory)

	// Review routes (protected)
	protected.Post("/products/:product_id/reviews", reviewHandler.CreateReview)

	// Address routes (protected)
	addresses := protected.Group("/addresses")
	addresses.Get("/", addressHandler.ListAddresses)
	addresses.Post("/", addressHandler.CreateAddress)
	addresses.Put("/:id", addressHandler.UpdateAddress)
	addresses.Delete("/:id", addressHandler.DeleteAddress)

	// Admin routes
	admin := app.Group("/api/v1/admin", middleware.AdminMiddleware(authService))
	admin.Get("/orders", orderHandler.AdminListOrders)
	admin.Get("/orders/:id", orderHandler.AdminGetOrder)
	admin.Put("/orders/:id/status", orderHandler.AdminUpdateOrderStatus)

	// Payment routes
	paymentRepo := repository.NewOrderRepository(db)
	paymentService := service.NewPaymentService(paymentRepo)
	paymentHandler := handler.NewPaymentHandler(paymentService)

	api.Post("/payments/create", paymentHandler.CreatePayment)
	api.Post("/payments/paypal/callback", paymentHandler.PayPalCallback)
	api.Post("/payments/stripe/callback", paymentHandler.StripeCallback)
	admin.Post("/orders/:id/refund", paymentHandler.AdminRefundOrder)

	// Admin - Product Management
	productAdminService := adminservice.NewProductAdminService(productRepo)
	productAdminHandler := adminhandler.NewProductAdminHandler(productAdminService)

	admin.Get("/products", productAdminHandler.ListProducts)
	admin.Get("/products/:id", productAdminHandler.GetProduct)
	admin.Post("/products", productAdminHandler.CreateProduct)
	admin.Put("/products/:id", productAdminHandler.UpdateProduct)
	admin.Delete("/products/:id", productAdminHandler.DeleteProduct)
	admin.Get("/categories", productAdminHandler.ListCategories)
	admin.Post("/categories", productAdminHandler.CreateCategory)

	// Admin - Image Upload
	uploadHandler := adminhandler.NewUploadHandler("./uploads", "/uploads")
	admin.Post("/upload", uploadHandler.UploadImage)
	admin.Post("/uploads", uploadHandler.UploadImages)

	// Admin - Mall User Management
	userAdminService := adminservice.NewUserAdminService(userRepo)
	userAdminHandler := adminhandler.NewUserAdminHandler(userAdminService)

	admin.Get("/users", userAdminHandler.ListUsers)
	admin.Get("/users/:id", userAdminHandler.GetUser)
	admin.Put("/users/:id/status", userAdminHandler.UpdateUserStatus)

	// Admin - Admin User Management
	adminUserRepo := repository.NewAdminUserRepository(db)
	adminUserAdminService := adminservice.NewAdminUserAdminService(adminUserRepo)
	adminUserHandler := adminhandler.NewAdminUserHandler(adminUserAdminService)

	admin.Get("/admins", adminUserHandler.ListAdminUsers)
	admin.Get("/admins/:id", adminUserHandler.GetAdminUser)
	admin.Post("/admins", adminUserHandler.CreateAdminUser)
	admin.Put("/admins/:id/status", adminUserHandler.UpdateAdminUserStatus)
	admin.Delete("/admins/:id", adminUserHandler.DeleteAdminUser)

	// Admin - Dashboard
	dashboardService := adminservice.NewDashboardService(db, orderRepo, productRepo, userRepo)
	dashboardHandler := adminhandler.NewDashboardHandler(dashboardService)

	admin.Get("/dashboard/stats", dashboardHandler.GetStats)
	admin.Get("/dashboard/orders-status", dashboardHandler.GetOrderStatusCounts)
	admin.Get("/dashboard/top-products", dashboardHandler.GetTopProducts)
}
