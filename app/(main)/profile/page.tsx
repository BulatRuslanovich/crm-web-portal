'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api/users';
import { extractApiError } from '@/lib/api/errors';
import {
  Card, CardFooter, Field, Label, Input,
  ErrorBox, SuccessBox, BtnPrimary, BtnSecondary, BtnDanger,
} from '@/components/ui';

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

  const displayName = user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.login;
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
    } finally { setSaving(false); }
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
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-(--fg)">Профиль</h2>

      {/* Identity card */}
      <Card>
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-(--primary) flex items-center justify-center text-(--primary-fg) text-lg font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-(--fg) truncate">{displayName}</p>
            <p className="text-xs text-(--fg-muted)">{user.login}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.policies.map((p) => (
                <span key={p} className="text-xs px-1.5 py-0.5 bg-(--warn-subtle) text-(--warn-text) border border-(--warn-border) rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile info */}
      <Card>
        <div className="px-5 py-3.5 border-b border-(--border)">
          <p className="text-sm font-semibold text-(--fg)">Личные данные</p>
        </div>

        {!editingProfile ? (
          <>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <BtnSecondary onClick={() => { setEditingProfile(true); setProfileSuccess(''); }}>
                Редактировать
              </BtnSecondary>
            </CardFooter>
          </>
        ) : (
          <form action={handleProfileSave}>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Имя</Label><Input name="firstName" type="text" defaultValue={user.firstName ?? ''} /></div>
                <div><Label>Фамилия</Label><Input name="lastName" type="text" defaultValue={user.lastName ?? ''} /></div>
                <div><Label>Email</Label><Input name="email" type="email" defaultValue={user.email ?? ''} /></div>
                <div><Label>Телефон</Label><Input name="phone" type="tel" defaultValue={user.phone ?? ''} /></div>
              </div>
              {profileError && <ErrorBox message={profileError} />}
            </div>
            <CardFooter>
              <BtnSecondary type="button" onClick={() => setEditingProfile(false)}>Отмена</BtnSecondary>
              <BtnPrimary type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</BtnPrimary>
            </CardFooter>
          </form>
        )}
      </Card>

      {/* Password */}
      <Card>
        <div className="px-5 py-3.5 border-b border-(--border)">
          <p className="text-sm font-semibold text-(--fg)">Безопасность</p>
        </div>

        {!editingPassword ? (
          <>
            {passwordSuccess && (
              <div className="px-5 pt-3">
                <SuccessBox message={passwordSuccess} />
              </div>
            )}
            <CardFooter>
              <BtnSecondary onClick={() => { setEditingPassword(true); setPasswordSuccess(''); }}>
                Изменить пароль
              </BtnSecondary>
            </CardFooter>
          </>
        ) : (
          <form action={handlePasswordSave}>
            <div className="p-5 space-y-3">
              <div><Label required>Текущий пароль</Label><Input name="oldPassword" type="password" required /></div>
              <div><Label required>Новый пароль</Label><Input name="newPassword" type="password" required /></div>
              <div><Label required>Повторите пароль</Label><Input name="confirm" type="password" required /></div>
              {passwordError && <ErrorBox message={passwordError} />}
            </div>
            <CardFooter>
              <BtnSecondary type="button" onClick={() => setEditingPassword(false)}>Отмена</BtnSecondary>
              <BtnPrimary type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Изменить'}</BtnPrimary>
            </CardFooter>
          </form>
        )}
      </Card>

      {/* Logout */}
      <Card>
        <div className="p-5">
          <BtnDanger onClick={logout} className="w-full">Выйти из аккаунта</BtnDanger>
        </div>
      </Card>
    </div>
  );
}
