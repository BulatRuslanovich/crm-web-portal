import type { RegisterOptions } from 'react-hook-form';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;
const LOGIN_PATTERN = /^[a-zA-Z0-9_.-]+$/;

export const authRules = {
  email: {
    required: 'Введите email',
    pattern: { value: EMAIL_PATTERN, message: 'Введите корректный email' },
  },
  login: {
    required: 'Введите логин',
    minLength: { value: 3, message: 'Логин должен быть не короче 3 символов' },
    pattern: {
      value: LOGIN_PATTERN,
      message: 'Логин может содержать латиницу, цифры, точку, дефис и подчёркивание',
    },
  },
  password: {
    required: 'Введите пароль',
    minLength: { value: 8, message: 'Пароль должен быть не короче 8 символов' },
  },
  code: {
    required: 'Введите код',
    pattern: { value: CODE_PATTERN, message: 'Код должен состоять из 6 цифр' },
  },
  firstName: {
    required: 'Введите имя',
    validate: (v: string) => v.trim().length > 0 || 'Введите имя',
  },
  lastName: {
    required: 'Введите фамилию',
    validate: (v: string) => v.trim().length > 0 || 'Введите фамилию',
  },
} satisfies Record<string, RegisterOptions>;
