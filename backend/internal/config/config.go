package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type RedisConfig struct {
	Host string
	Port string
}

type JWTConfig struct {
	Secret         string
	AccessExpiry   int
	RefreshExpiry  int
}

func Load() *Config {
	viper.SetConfigFile(".env")
	viper.SetConfigType("env")
	viper.AutomaticEnv()
	viper.ReadInConfig()

	cfg := &Config{
		Server: ServerConfig{
			Port: viper.GetString("SERVER_PORT"),
			Mode: viper.GetString("SERVER_MODE"),
		},
		Database: DatabaseConfig{
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			DBName:   viper.GetString("DB_NAME"),
		},
		Redis: RedisConfig{
			Host: viper.GetString("REDIS_HOST"),
			Port: viper.GetString("REDIS_PORT"),
		},
		JWT: JWTConfig{
			Secret:         viper.GetString("JWT_SECRET"),
			AccessExpiry:   viper.GetInt("JWT_ACCESS_EXPIRY"),
			RefreshExpiry:  viper.GetInt("JWT_REFRESH_EXPIRY"),
		},
	}

	if cfg.Server.Port == "" {
		cfg.Server.Port = "8080"
	}
	if cfg.JWT.AccessExpiry == 0 {
		cfg.JWT.AccessExpiry = 15
	}
	if cfg.JWT.RefreshExpiry == 0 {
		cfg.JWT.RefreshExpiry = 20160
	}

	return cfg
}
