package models

type AccountData struct {
	UserID       uint
	VerifyStatus string
	Role         string
	ErrVerif     error
}
