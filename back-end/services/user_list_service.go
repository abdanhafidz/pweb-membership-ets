package services

import (
	"errors"

	"pweb-api.abdanhafidz.com/models"
	"pweb-api.abdanhafidz.com/repositories"
)

type UserListService struct {
	Service[models.Account, []models.UserProfileResponse]
}

func (s *UserListService) Retrieve() {
	userListRepo := repositories.GetAllAccount()
	s.Error = userListRepo.RowsError
	for _, user := range userListRepo.Result {
		if user.Role != "admin" {
			userDetailsRepo := repositories.GetDetailAccountById(user.Id)
			s.Error = errors.Join(userDetailsRepo.RowsError)
			if s.Error != nil {
				return
			}
			s.Result = append(s.Result, models.UserProfileResponse{
				Account: user,
				Details: userDetailsRepo.Result,
			})
		}
	}
	return
}

func (s *UserListService) Delete() {
	deleteUserRepo := repositories.DeleteAccountbyId(s.Constructor.Id)
	if deleteUserRepo.NoRecord {
		s.Exception.DataNotFound = true
		s.Exception.Message = "user not found"
		return
	}
	s.Error = deleteUserRepo.RowsError
	s.Retrieve()
	return
}
