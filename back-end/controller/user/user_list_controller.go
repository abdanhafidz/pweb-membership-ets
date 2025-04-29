package user

import (
	"github.com/gin-gonic/gin"
	"pweb-api.abdanhafidz.com/controller"
	"pweb-api.abdanhafidz.com/models"
	"pweb-api.abdanhafidz.com/services"
)

func List(c *gin.Context) {
	userList := services.UserListService{}
	userListController := controller.Controller[any, models.Account, []models.UserProfileResponse]{
		Service: &userList.Service,
	}
	userListController.HeaderParse(c, func() {
		userList.Retrieve()
		userListController.Response(c)
	})
}
