package config

import (
	"log"
	"os"
	"time"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase initializes the database connection
func InitDatabase() *gorm.DB {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()
	_ = viper.ReadInConfig()

	dbHost := viper.GetString("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := viper.GetString("DB_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}
	dbUser := viper.GetString("DB_USER")
	if dbUser == "" {
		dbUser = "ecommerce"
	}
	dbPassword := viper.GetString("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "ecpassword"
	}
	dbName := viper.GetString("DB_NAME")
	if dbName == "" {
		dbName = "ecommerce"
	}

	dsn := dbUser + ":" + dbPassword + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbName + "?charset=utf8mb4&parseTime=True&loc=Local"

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
		NowFunc: func() time.Time {
			return time.Now()
		},
	})

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Set connection pool settings
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	DB = db
	log.Println("Database connection established successfully!")
	return db
}
