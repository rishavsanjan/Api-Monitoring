package security

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"os"
)

type EncryptionService struct {
	key []byte
}

func NewEncryptionService(secretKey string) *EncryptionService {

	return &EncryptionService{
		key: []byte(secretKey),
	}
}

func (e *EncryptionService) Encrypt(
	plainText string,
) (string, error) {
	fmt.Println("en key")
	fmt.Println(os.Getenv("ENCRYPTION_KEY"))
	fmt.Println(e.key)
	block, err := aes.NewCipher(e.key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())

	_, err = io.ReadFull(rand.Reader, nonce)
	if err != nil {
		return "", err
	}

	cipherText := aesGCM.Seal(
		nonce,
		nonce,
		[]byte(plainText),
		nil,
	)

	return base64.StdEncoding.EncodeToString(
		cipherText,
	), nil
}

func (e *EncryptionService) Decrypt(
	encryptedText string,
) (string, error) {

	cipherText, err := base64.StdEncoding.DecodeString(
		encryptedText,
	)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(e.key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()

	if len(cipherText) < nonceSize {
		return "", fmt.Errorf("invalid ciphertext")
	}

	nonce, encryptedBytes := cipherText[:nonceSize],
		cipherText[nonceSize:]

	plainText, err := aesGCM.Open(
		nil,
		nonce,
		encryptedBytes,
		nil,
	)
	if err != nil {
		return "", err
	}

	return string(plainText), nil
}
