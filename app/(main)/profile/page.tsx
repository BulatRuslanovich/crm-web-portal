'use client';

import { useState } from 'react';
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

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user.login;
  const initials = (user.firstName?.[0] ?? user.login[0]).toUpperCase();

  async function handleProfileSave(fd: FormData) {
    setProfileError('');
    setProfileSuccess('');
    setSaving(true);
    try {
      await usersApi.update(user!.usrId, {
        firstName: (fd.get('firstName') as string) || null,
        lastName: (fd.get('lastName') as string) || null,
        email: (fd.get('email') as string) || null,
        phone: (fd.get('phone') as string) || null,
      });
      await refreshUser();
      setEditingProfile(false);
      setProfileSuccess('Профиль обновлён');
    } catch (err) {
      setProfileError(extractApiError(err, 'Ошибка обновления'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave(fd: FormData) {
    setPasswordError('');
    setPasswordSuccess('');
    const newPassword = fd.get('newPassword') as string;
    const confirm = fd.get('confirm') as string;
    if (newPassword !== confirm) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    setSaving(true);
    try {
      await usersApi.changePassword(user!.usrId, {
        oldPassword: fd.get('oldPassword') as string,
        newPassword,
      });
      setEditingPassword(false);
      setPasswordSuccess('Пароль изменён');
    } catch (err) {
      setPasswordError(extractApiError(err, 'Ошибка смены пароля'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-xl font-bold text-(--fg)">Профиль</h2>

      {/* Identity card */}
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

      {/* Profile info */}
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
              <Field label="Телефон" value={user.phone} />
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
                }}
              >
                Редактировать
              </BtnSecondary>
            </CardFooter>
          </>
        ) : (
          <form action={handleProfileSave}>
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Имя</Label>
                  <Input name="firstName" type="text" defaultValue={user.firstName ?? ''} />
                </div>
                <div>
                  <Label>Фамилия</Label>
                  <Input name="lastName" type="text" defaultValue={user.lastName ?? ''} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={user.email ?? ''} />
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input name="phone" type="tel" defaultValue={user.phone ?? ''} />
                </div>
              </div>
              {profileError && <ErrorBox message={profileError} />}
            </div>
            <CardFooter>
              <BtnSecondary type="button" onClick={() => setEditingProfile(false)}>
                Отмена
              </BtnSecondary>
              <BtnPrimary type="submit" disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </BtnPrimary>
            </CardFooter>
          </form>
        )}
      </Card>

      {/* Password */}
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
                }}
              >
                <KeyRound size={14} /> Изменить пароль
              </BtnSecondary>
            </CardFooter>
          </>
        ) : (
          <form action={handlePasswordSave}>
            <div className="space-y-3 p-5">
              <div>
                <Label required>Текущий пароль</Label>
                <Input name="oldPassword" type="password" required />
              </div>
              <div>
                <Label required>Новый пароль</Label>
                <Input name="newPassword" type="password" required />
              </div>
              <div>
                <Label required>Повторите пароль</Label>
                <Input name="confirm" type="password" required />
              </div>
              {passwordError && <ErrorBox message={passwordError} />}
            </div>
            <CardFooter>
              <BtnSecondary type="button" onClick={() => setEditingPassword(false)}>
                Отмена
              </BtnSecondary>
              <BtnPrimary type="submit" disabled={saving}>
                {saving ? 'Сохранение...' : 'Изменить'}
              </BtnPrimary>
            </CardFooter>
          </form>
        )}
      </Card>

      {/* Logout */}
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
