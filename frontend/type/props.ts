export interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export interface SignupForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    agree: boolean;
}
