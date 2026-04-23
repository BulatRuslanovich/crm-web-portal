'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api/users';
import { extractApiError } from '@/lib/api/errors';
import {
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
import {
  User,
  Shield,
  KeyRound,
  LogOut,
  Mail,
  AtSign,
  Pencil,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';

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

const POLICY_LABEL: Record<string, string> = {
  Admin: 'Администратор',
  Director: 'Руководитель',
  Manager: 'Менеджер',
  User: 'Сотрудник',
};

function policyTone(policy: string): string {
  switch (policy) {
    case 'Admin':
      return 'border-warning/40 bg-warning/15 text-warning';
    case 'Director':
      return 'border-primary/40 bg-primary/10 text-primary';
    case 'Manager':
      return 'border-success/40 bg-success/10 text-success';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  tone = 'default',
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  children: React.ReactNode;
}) {
  const toneCls =
    tone === 'primary'
      ? 'bg-primary/10 text-primary ring-primary/15'
      : tone === 'success'
        ? 'bg-success/10 text-success ring-success/20'
        : tone === 'warning'
          ? 'bg-warning/15 text-warning ring-warning/25'
          : tone === 'destructive'
            ? 'bg-destructive/10 text-destructive ring-destructive/20'
            : 'bg-muted text-muted-foreground ring-border';
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${toneCls}`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function CardFooterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
      {children}
    </div>
  );
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
  const initials = ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? ''))
    .toUpperCase()
    || user.login.slice(0, 2).toUpperCase();

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
    <PageTransition className="mx-auto w-full space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-muted to-card shadow-sm">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5 p-6">
          <div className="relative">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg ring-4 ring-card">
              {initials}
            </div>
            <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground ring-2 ring-card">
              <BadgeCheck size={13} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Профиль
            </p>
            <h2 className="truncate text-2xl font-bold text-foreground">{displayName}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <AtSign size={12} />
                <span className="font-medium text-foreground/90">{user.login}</span>
              </span>
              {user.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={12} />
                  {user.email}
                </span>
              )}
            </div>
            {user.policies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user.policies.map((p) => (
                  <span
                    key={p}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${policyTone(
                      p,
                    )}`}
                  >
                    {POLICY_LABEL[p] ?? p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <SectionCard
        icon={User}
        title="Личные данные"
        subtitle="Имя, фамилия и контакты"
        tone="primary"
      >
        {!editingProfile ? (
          <>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <Field label="Имя" value={user.firstName} />
              <Field label="Фамилия" value={user.lastName} />
              <Field label="Email" value={user.email} />
              <Field label="Логин" value={user.login} />
            </div>
            {profileSuccess && (
              <div className="px-5 pb-4">
                <SuccessBox message={profileSuccess} />
              </div>
            )}
            <CardFooterBar>
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
                <Pencil size={13} /> Редактировать
              </BtnSecondary>
            </CardFooterBar>
          </>
        ) : (
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <div className="space-y-4 p-5">
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
            <CardFooterBar>
              <BtnSecondary type="button" onClick={() => setEditingProfile(false)}>
                Отмена
              </BtnSecondary>
              <BtnPrimary type="submit" disabled={profileForm.formState.isSubmitting}>
                <CheckCircle2 size={13} />
                {profileForm.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </BtnPrimary>
            </CardFooterBar>
          </form>
        )}
      </SectionCard>

      <SectionCard
        icon={Shield}
        title="Безопасность"
        subtitle="Пароль и доступ к аккаунту"
        tone="success"
      >
        {!editingPassword ? (
          <>
            <div className="flex items-start gap-3 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
                <KeyRound size={13} className="text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Пароль</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Рекомендуем менять пароль раз в 90 дней
                </p>
              </div>
            </div>
            {passwordSuccess && (
              <div className="px-5 pb-3">
                <SuccessBox message={passwordSuccess} />
              </div>
            )}
            <CardFooterBar>
              <BtnSecondary
                onClick={() => {
                  setEditingPassword(true);
                  setPasswordSuccess('');
                  passwordForm.reset();
                }}
              >
                <KeyRound size={13} /> Изменить пароль
              </BtnSecondary>
            </CardFooterBar>
          </>
        ) : (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <div className="space-y-3 p-5">
              <div>
                <Label required>Текущий пароль</Label>
                <Input type="password" autoComplete="current-password" {...passwordForm.register('oldPassword')} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label required>Новый пароль</Label>
                  <Input type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
                </div>
                <div>
                  <Label required>Повторите пароль</Label>
                  <Input type="password" autoComplete="new-password" {...passwordForm.register('confirm')} />
                </div>
              </div>
              {passwordApiError && <ErrorBox message={passwordApiError} />}
            </div>
            <CardFooterBar>
              <BtnSecondary type="button" onClick={() => setEditingPassword(false)}>
                Отмена
              </BtnSecondary>
              <BtnPrimary type="submit" disabled={passwordForm.formState.isSubmitting}>
                <CheckCircle2 size={13} />
                {passwordForm.formState.isSubmitting ? 'Сохранение...' : 'Изменить'}
              </BtnPrimary>
            </CardFooterBar>
          </form>
        )}
      </SectionCard>

      <SectionCard
        icon={LogOut}
        title="Выход"
        subtitle="Завершить текущую сессию"
        tone="destructive"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-xs text-muted-foreground">
            После выхода потребуется ввести логин и пароль заново.
          </p>
          <BtnDanger onClick={logout}>
            <LogOut size={13} /> Выйти из аккаунта
          </BtnDanger>
        </div>
      </SectionCard>
    </PageTransition>
  );
}
