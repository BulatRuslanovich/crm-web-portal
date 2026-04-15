'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api/users';
import { extractApiError } from '@/lib/api/errors';
import {
  Card,
  CardFooter,
  Field,
  Label,
  Input,
  ErrorBox,
  SuccessBox,
  BtnPrimary,
  BtnSecondary,
  BtnDanger,
} from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { User, Shield, KeyRound, LogOut } from 'lucide-react';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileApiError, setProfileApiError] = useState('');
  const [passwordApiError, setPasswordApiError] = useState('');

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { oldPassword: '', newPassword: '', confirm: '' },
  });

  if (!user) return null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user.login;
  const initials = (user.firstName?.[0] ?? user.login[0]).toUpperCase();

  async function onProfileSubmit(values: ProfileFormValues) {
    setProfileApiError('');
    setProfileSuccess('');
    try {
      await usersApi.update(user!.usrId, {
        firstName: values.firstName || null,
        lastName: values.lastName || null,
      });
      await refreshUser();
      setEditingProfile(false);
      setProfileSuccess('Профиль обновлён');
    } catch (err) {
      setProfileApiError(extractApiError(err, 'Ошибка обновления'));
    }
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    setPasswordApiError('');
    setPasswordSuccess('');
    if (values.newPassword !== values.confirm) {
      setPasswordApiError('Пароли не совпадают');
      return;
    }
    try {
      await usersApi.changePassword(user!.usrId, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      setEditingPassword(false);
      setPasswordSuccess('Пароль изменён');
      passwordForm.reset();
    } catch (err) {
      setPasswordApiError(extractApiError(err, 'Ошибка смены пароля'));
    }
  }

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-xl font-bold text-(--fg)">Профиль</h2>

      <Card>
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--violet-text) text-xl font-bold text-(--primary-fg) shadow-md">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-(--fg)">{displayName}</p>
            <p className="text-sm text-(--fg-muted)">{user.login}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.policies.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-(--warn-border) bg-(--warn-subtle) px-2 py-0.5 text-xs font-medium text-(--warn-text)"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-(--border) px-5 py-3.5">
          <div className="flex items-center gap-2">
            <User size={15} className="text-(--fg-muted)" />
            <p className="text-sm font-bold text-(--fg)">Личные данные</p>
          </div>
        </div>

        {!editingProfile ? (
          <>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <Field label="Имя" value={user.firstName} />
              <Field label="Фамилия" value={user.lastName} />
              <Field label="Email" value={user.email} />
            </div>
            {profileSuccess && (
              <div className="px-5 pb-3">
                <SuccessBox message={profileSuccess} />
              </div>
            )}
            <CardFooter>
              <BtnSecondary
                onClick={() => {
                  setEditingProfile(true);
                  setProfileSuccess('');
                  profileForm.reset({
                    firstName: user.firstName ?? '',
                    lastName: user.lastName ?? '',
                  });
                }}
              >
                Редактировать
              </BtnSecondary>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Имя</Label>
                  <Input type="text" {...profileForm.register('firstName')} />
                </div>
                <div>
                  <Label>Фамилия</Label>
                  <Input type="text" {...profileForm.register('lastName')} />
                </div>
              </div>
              {profileApiError && <ErrorBox message={profileApiError} />}
            </div>
            <CardFooter>
              <BtnSecondary type="button" onClick={() => setEditingProfile(false)}>
                Отмена
              </BtnSecondary>
              <BtnPrimary type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </BtnPrimary>
            </CardFooter>
          </form>
        )}
      </Card>

      <Card>
        <div className="border-b border-(--border) px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-(--fg-muted)" />
            <p className="text-sm font-bold text-(--fg)">Безопасность</p>
          </div>
        </div>

        {!editingPassword ? (
          <>
            {passwordSuccess && (
              <div className="px-5 pt-3">
                <SuccessBox message={passwordSuccess} />
              </div>
            )}
            <CardFooter>
              <BtnSecondary
                onClick={() => {
                  setEditingPassword(true);
                  setPasswordSuccess('');
                  passwordForm.reset();
                }}
              >
                <KeyRound size={14} /> Изменить пароль
              </BtnSecondary>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <div className="space-y-3 p-5">
              <div>
                <Label required>Текущий пароль</Label>
                <Input type="password" {...passwordForm.register('oldPassword')} />
              </div>
              <div>
                <Label required>Новый пароль</Label>
                <Input type="password" {...passwordForm.register('newPassword')} />
              </div>
              <div>
                <Label required>Повторите пароль</Label>
                <Input type="password" {...passwordForm.register('confirm')} />
              </div>
              {passwordApiError && <ErrorBox message={passwordApiError} />}
            </div>
            <CardFooter>
              <BtnSecondary type="button" onClick={() => setEditingPassword(false)}>
                Отмена
              </BtnSecondary>
              <BtnPrimary type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? 'Сохранение...' : 'Изменить'}
              </BtnPrimary>
            </CardFooter>
          </form>
        )}
      </Card>

      <Card>
        <div className="p-5">
          <BtnDanger onClick={logout} className="w-full">
            <LogOut size={15} /> Выйти из аккаунта
          </BtnDanger>
        </div>
      </Card>
    </PageTransition>
  );
}
