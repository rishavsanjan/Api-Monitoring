package auth

import (
	"api-monitoring-saas/internal/models"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) Register(email string, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10);

	if err != nil {
		return err
	}

	user := models.User{
		ID: uuid.New().String(),
		Email: email,
		Password: string(hash),
		CreatedAt: time.Now(),
	}

	return s.repo.CreateUser(&user)
}

func (s *Service) Login(email string, password string) (string, error) {
	user , err := s.repo.GetUserByEmail(email)

	if err != nil {
		return "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password));

	if err != nil {
		return  "wrong password", err
	}

	token, err := GenerateToken(user.ID)

	if err != nil {
		return "", err
	}

	return  token, nil

}

func GenerateToken(userID string) (string, error) {

	secret := []byte(os.Getenv("JWT_SECRET"))

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	return token.SignedString(secret)
}