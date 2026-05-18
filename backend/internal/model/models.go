package model

import (
	"encoding/json"
	"time"
)

// User represents a customer account
type User struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	Email     string     `json:"email" gorm:"uniqueIndex; not null; size:255"`
	Password  string     `json:"-" gorm:"not null; size:255"` // never expose password in API
	Name      string     `json:"name" gorm:"size:255"`
	Phone     string     `json:"phone" gorm:"size:50"`
	Status    string     `json:"status" gorm:"default:'active'; size:50"` // active, suspended, deleted
	CreatedAt int64      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt int64      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"-" gorm:"index"`
}

// UserAddress stores shipping/billing addresses
type UserAddress struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	UserID    uint   `json:"user_id" gorm:"not null; index"`
	Name      string `json:"name" gorm:"size:100"`
	Phone     string `json:"phone" gorm:"size:50"`
	Country   string `json:"country" gorm:"size:100"`
	State     string `json:"state" gorm:"size:100"`
	City      string `json:"city" gorm:"size:100"`
	District  string `json:"district" gorm:"size:100"`
	Street    string `json:"street" gorm:"size:500"`
	ZipCode   string `json:"zip_code" gorm:"size:20"`
	IsDefault bool   `json:"is_default" gorm:"default:false"`
	CreatedAt int64  `json:"created_at" gorm:"autoCreateTime"`
}

// ProductCategory organizes products
type ProductCategory struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Name      string `json:"name" gorm:"size:255; not null"`
	Slug      string `json:"slug" gorm:"uniqueIndex; size:255"`
	ParentID  *uint  `json:"parent_id" gorm:"index"`
	ImageURL  string `json:"image_url" gorm:"size:500"`
	Status    string `json:"status" gorm:"default:'active'; size:50"` // active, inactive
	SortOrder int    `json:"sort_order" gorm:"default:0"`
	CreatedAt int64  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt int64  `json:"updated_at" gorm:"autoUpdateTime"`
}

// Product represents a single product item
type Product struct {
	ID            uint               `json:"id" gorm:"primaryKey"`
	Title         string             `json:"title" gorm:"size:500; not null"`
	Slug          string             `json:"slug" gorm:"uniqueIndex; size:500"`
	Description   string             `json:"description" gorm:"type:text"`
	ShortDesc     string             `json:"short_desc" gorm:"size:500"`
	CategoryID    uint               `json:"category_id" gorm:"index"`
	Price         float64            `json:"price" gorm:"type:decimal(10,2); not null"`
	ComparePrice  float64            `json:"compare_price" gorm:"type:decimal(10,2)"`
	Stock         int                `json:"stock" gorm:"default:0"`
	Weight        float64            `json:"weight" gorm:"type:decimal(10,2); default:0"` // kg
	Status        string             `json:"status" gorm:"default:'draft'; size:50"` // draft, active, inactive, out_of_stock
	Images        string             `json:"images" gorm:"type:text"`
	IsFeatured    bool               `json:"is_featured" gorm:"default:false"`
	SalesCount    int                `json:"sales_count" gorm:"default:0"`
	MetaTitle     string             `json:"meta_title" gorm:"size:500"`
	MetaDesc      string             `json:"meta_desc" gorm:"type:text"`
	CreatedAt     int64              `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     int64              `json:"updated_at" gorm:"autoUpdateTime"`
}

// ProductSKU represents variations of a product
type ProductSKU struct {
	ID         uint    `json:"id" gorm:"primaryKey"`
	ProductID  uint    `json:"product_id" gorm:"not null; index"`
	Title      string  `json:"title" gorm:"size:255"`
	Code       string  `json:"code" gorm:"uniqueIndex; size:255"`
	Price      float64 `json:"price" gorm:"type:decimal(10,2)"`
	Stock      int     `json:"stock" gorm:"default:0"`
	ImageURL   string  `json:"image_url" gorm:"size:500"`
	SortOrder  int     `json:"sort_order" gorm:"default:0"`
	CreatedAt  int64   `json:"created_at" gorm:"autoCreateTime"`
}

// Cart holds user's current shopping items
type Cart struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	UserID    uint       `json:"user_id" gorm:"not null; uniqueIndex"`
	CreatedAt int64      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt int64      `json:"updated_at" gorm:"autoUpdateTime"`
	Items     []CartItem `json:"items" gorm:"foreignKey:CartID; not null"`
}

// CartItem represents single item in cart
type CartItem struct {
	ID        uint     `json:"id" gorm:"primaryKey"`
	CartID    uint     `json:"cart_id" gorm:"not null; index"`
	ProductID uint     `json:"product_id" gorm:"not null"`
	Product   Product  `json:"product" gorm:"foreignKey:ProductID"`
	SkuID     *uint    `json:"sku_id" gorm:"index"`
	Quantity  int      `json:"quantity" gorm:"not null; default:1"`
	CreatedAt int64    `json:"created_at" gorm:"autoCreateTime"`
}

// Order represents a customer purchase
type Order struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	OrderNo        string     `json:"order_no" gorm:"uniqueIndex; size:50; not null"`
	UserID         uint       `json:"user_id" gorm:"index"`
	Status         string     `json:"status" gorm:"default:'pending'; size:50"` // pending, paid, processing, shipped, delivered, cancelled, refunded
	TotalAmount    float64    `json:"total_amount" gorm:"type:decimal(10,2); not null"`
	DiscountAmount float64    `json:"discount_amount" gorm:"type:decimal(10,2); default:0"`
	ShippingFee    float64    `json:"shipping_fee" gorm:"type:decimal(10,2); default:0"`
	Currency       string     `json:"currency" gorm:"default:'USD'; size:10"`
	PaymentMethod  string     `json:"payment_method" gorm:"size:100"`
	PaymentStatus  string     `json:"payment_status" gorm:"default:'pending'; size:50"`
	PaymentID      string     `json:"payment_id" gorm:"size:255"`
	ShippingName   string     `json:"-" gorm:"size:100"`
	ShippingPhone  string     `json:"-" gorm:"size:50"`
	ShippingCountry string    `json:"-" gorm:"size:100"`
	ShippingState  string     `json:"-" gorm:"size:100"`
	ShippingCity   string     `json:"-" gorm:"size:100"`
	ShippingStreet string     `json:"-" gorm:"size:500"`
	ShippingZipCode string    `json:"-" gorm:"size:20"`
	Note           string     `json:"note" gorm:"type:text"`
	CreatedAt      int64      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      int64      `json:"updated_at" gorm:"autoUpdateTime"`
	Items          []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
}

func (o *Order) MarshalJSON() ([]byte, error) {
	type Alias Order
	return json.Marshal(&struct {
		*Alias
		ShippingAddress OrderAddress `json:"shipping_address"`
	}{
		Alias: (*Alias)(o),
		ShippingAddress: OrderAddress{
			Name:    o.ShippingName,
			Phone:   o.ShippingPhone,
			Country: o.ShippingCountry,
			State:   o.ShippingState,
			City:    o.ShippingCity,
			Street:  o.ShippingStreet,
			ZipCode: o.ShippingZipCode,
		},
	})
}

// OrderAddress stores shipping address for order snapshot
type OrderAddress struct {
	Name    string `json:"name" gorm:"size:100"`
	Phone   string `json:"phone" gorm:"size:50"`
	Country string `json:"country" gorm:"size:100"`
	State   string `json:"state" gorm:"size:100"`
	City    string `json:"city" gorm:"size:100"`
	Street  string `json:"street" gorm:"size:500"`
	ZipCode string `json:"zip_code" gorm:"size:20"`
}

// OrderItem stores individual product in order
type OrderItem struct {
	ID         uint    `json:"id" gorm:"primaryKey"`
	OrderID    uint    `json:"order_id" gorm:"not null; index"`
	ProductID  uint    `json:"product_id"`
	SkuID      *uint   `json:"sku_id"`
	ProductTitle string `json:"product_title" gorm:"size:255"`
	SkuCode    string  `json:"sku_code" gorm:"size:255"`
	Price      float64 `json:"price" gorm:"type:decimal(10,2); not null"`
	Quantity   int     `json:"quantity" gorm:"not null"`
	Subtotal   float64 `json:"subtotal" gorm:"type:decimal(10,2); not null"`
	ImageURL   string  `json:"image_url" gorm:"size:500"`
}

// OrderStatusHistory tracks all status changes
type OrderStatusHistory struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	OrderID   uint   `json:"order_id" gorm:"not null; index"`
	Status    string `json:"status" gorm:"size:50"`
	Note      string `json:"note" gorm:"type:text"`
	CreatedBy uint   `json:"created_by"`
	CreatedAt int64  `json:"created_at" gorm:"autoCreateTime"`
}

// AdminUser is for admin panel users
type AdminUser struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	Username  string     `json:"username" gorm:"uniqueIndex; not null; size:100"`
	Email     string     `json:"email" gorm:"uniqueIndex; not null; size:255"`
	Password  string     `json:"-" gorm:"not null; size:255"`
	Name      string     `json:"name" gorm:"size:255"`
	Avatar    string     `json:"avatar" gorm:"size:500"`
	Role      string     `json:"role" gorm:"default:'operator'; size:50"` // super_admin, product_admin, customer_service, finance
	Status    string     `json:"status" gorm:"default:'active'; size:50"`
	LastLogin int64      `json:"last_login"`
	CreatedAt int64      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt int64      `json:"updated_at" gorm:"autoUpdateTime"`
}

// Coupon for discounts and promotions
type Coupon struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Code            string    `json:"code" gorm:"uniqueIndex; not null; size:100"`
	Type            string    `json:"type" gorm:"default:'percent'; size:50"` // percent, fixed
	Value           float64   `json:"value" gorm:"type:decimal(10,2); not null"`
	MinOrderAmount  float64   `json:"min_order_amount" gorm:"type:decimal(10,2)"`
	MaxDiscount     float64   `json:"max_discount" gorm:"type:decimal(10,2)"`
	UsageLimit      int       `json:"usage_limit" gorm:"default:0"`
	UsageCount      int       `json:"usage_count" gorm:"default:0"`
	StartsAt        int64     `json:"starts_at"`
	ExpiresAt       int64     `json:"expires_at"`
	Status          string    `json:"status" gorm:"default:'active'; size:50"` // active, inactive
	Description     string    `json:"description" gorm:"type:text"`
	CreatedAt       int64     `json:"created_at" gorm:"autoCreateTime"`
}
