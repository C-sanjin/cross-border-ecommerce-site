package service

import (
	"errors"

	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/model"
	"github.com/C-sanjin/cross-border-ecommerce/backend/internal/repository"
)

type AddressService struct {
	addressRepo *repository.AddressRepository
}

func NewAddressService(addressRepo *repository.AddressRepository) *AddressService {
	return &AddressService{addressRepo: addressRepo}
}

type CreateAddressRequest struct {
	Name      string `json:"name"`
	Phone     string `json:"phone"`
	Country   string `json:"country"`
	State     string `json:"state"`
	City      string `json:"city"`
	District  string `json:"district"`
	Street    string `json:"street"`
	ZipCode   string `json:"zip_code"`
	IsDefault bool   `json:"is_default"`
}

func (s *AddressService) ListAddresses(userID uint) ([]model.UserAddress, error) {
	return s.addressRepo.FindByUserID(userID)
}

func (s *AddressService) CreateAddress(userID uint, req *CreateAddressRequest) (*model.UserAddress, error) {
	if req.Name == "" || req.Phone == "" || req.Country == "" {
		return nil, errors.New("name, phone and country are required")
	}
	if req.IsDefault {
		s.addressRepo.ClearDefault(userID)
	}
	addr := &model.UserAddress{
		UserID:    userID,
		Name:      req.Name,
		Phone:     req.Phone,
		Country:   req.Country,
		State:     req.State,
		City:      req.City,
		District:  req.District,
		Street:    req.Street,
		ZipCode:   req.ZipCode,
		IsDefault: req.IsDefault,
	}
	if err := s.addressRepo.Create(addr); err != nil {
		return nil, err
	}
	return addr, nil
}

func (s *AddressService) UpdateAddress(userID uint, addressID uint, req *CreateAddressRequest) (*model.UserAddress, error) {
	addr, err := s.addressRepo.FindByID(addressID)
	if err != nil {
		return nil, errors.New("address not found")
	}
	if addr.UserID != userID {
		return nil, errors.New("unauthorized")
	}
	if req.IsDefault {
		s.addressRepo.ClearDefault(userID)
	}
	addr.Name = req.Name
	addr.Phone = req.Phone
	addr.Country = req.Country
	addr.State = req.State
	addr.City = req.City
	addr.District = req.District
	addr.Street = req.Street
	addr.ZipCode = req.ZipCode
	addr.IsDefault = req.IsDefault
	if err := s.addressRepo.Update(addr); err != nil {
		return nil, err
	}
	return addr, nil
}

func (s *AddressService) DeleteAddress(userID uint, addressID uint) error {
	addr, err := s.addressRepo.FindByID(addressID)
	if err != nil {
		return errors.New("address not found")
	}
	if addr.UserID != userID {
		return errors.New("unauthorized")
	}
	return s.addressRepo.Delete(addressID)
}
