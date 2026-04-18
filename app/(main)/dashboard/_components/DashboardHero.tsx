function getGreeting(hour: number): string {
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function DashboardHero({ name }: { name: string }) {
  const greeting = getGreeting(new Date().getHours());

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-muted to-card px-6 py-8 shadow-sm">
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-foreground">
          {greeting}
          {name ? `, ${name}` : ''}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Вот что происходит в вашей CRM сегодня
        </p>
      </div>
    </div>
  );
}
