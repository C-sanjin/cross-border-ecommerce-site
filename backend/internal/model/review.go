package model

type ProductReview struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	ProductID uint   `json:"product_id" gorm:"not null; index"`
	UserID    uint   `json:"user_id" gorm:"not null; index"`
	UserName  string `json:"user_name" gorm:"size:100"`
	Rating    int    `json:"rating" gorm:"not null"`
	Title     string `json:"title" gorm:"size:255"`
	Content   string `json:"content" gorm:"type:text"`
	CreatedAt int64  `json:"created_at" gorm:"autoCreateTime"`
}
