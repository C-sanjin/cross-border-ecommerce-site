package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/config"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/middleware"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/router"
)

func main() {
	cfg := config.Load()
	db := config.InitDatabase()

	// Auto migrate database tables
	log.Println("Running database migrations...")
	if err := repository.NewBaseRepository(db).AutoMigrate(
		&model.User{},
		&model.UserAddress{},
		&model.ProductCategory{},
		&model.Product{},
		&model.ProductSKU{},
		&model.ProductReview{},
		&model.Cart{},
		&model.CartItem{},
		&model.Order{},
		&model.OrderItem{},
		&model.OrderStatusHistory{},
		&model.AdminUser{},
		&model.Coupon{},
	); err != nil {
		log.Fatal("Migration failed: ", err)
	}

	app := fiber.New(fiber.Config{
		AppName: "Cross-border E-commerce API",
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:   60 * time.Second,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	app.Use(middleware.SecurityHeaders())

	apiRateLimitGrp := app.Group("/api")
	apiRateLimitGrp.Use(middleware.RateLimiter(60))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "timestamp": time.Now().Unix()})
	})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"name": "Cross-border E-commerce API",
			"health": "/health",
		})
	})

	// Serve uploaded files as static content
	app.Static("/uploads", "./uploads")

	router.Setup(app, db, cfg)

	go func() {
		log.Printf("Server starting on port %s...", cfg.Server.Port)
		if err := app.Listen(":" + cfg.Server.Port); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server: ", err)
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c
	log.Println("Gracefully shutting down...")
	_ = app.Shutdown()
}
