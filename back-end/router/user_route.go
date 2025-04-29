package router

import (
	"github.com/gin-gonic/gin"
	UserController "pweb-api.abdanhafidz.com/controller/user"
	"pweb-api.abdanhafidz.com/middleware"
)

func UserRoute(router *gin.Engine) {
	routerGroup := router.Group("/api/v1/user")
	{
		routerGroup.GET("/me", middleware.AuthUser, UserController.Profile)
		routerGroup.GET("/list", middleware.AuthUser, UserController.List)
		routerGroup.DELETE("/:id_user", middleware.AuthAdmin, UserController.Delete)
		routerGroup.PUT("/me", middleware.AuthUser, UserController.UpdateProfile)
	}
}
