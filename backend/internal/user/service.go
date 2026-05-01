package user

type Service struct{
	repo *Repository
}

func NewService(repo *Repository)  *Service{
	return  &Service{
		repo: repo,
	}
}

func (s *Service) UpdateProfile(userId string , name string) error {
	return  s.repo.UpdateProfile(userId, name)
}