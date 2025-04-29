package user

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"pweb-api.abdanhafidz.com/controller"
	"pweb-api.abdanhafidz.com/models"
	"pweb-api.abdanhafidz.com/services"
)

func Delete(c *gin.Context) {
	userList := services.UserListService{}
	userListController := controller.Controller[any, models.Account, []models.UserProfileResponse]{
		Service: &userList.Service,
	}
	userListController.HeaderParse(c, func() {
		id_user, _ := strconv.Atoi(c.Param("id_user"))
		userListController.Service.Constructor.Id = uint(id_user)
		userList.Delete()
	})
}
