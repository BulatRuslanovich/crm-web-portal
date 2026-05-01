function getGreeting(hour: number): string {
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function DashboardHero({ name }: { name: string }) {
  const greeting = getGreeting(new Date().getHours());

  return (
    <div className="border-border from-primary/5 via-muted to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br px-6 py-8 shadow-sm">
      <div className="relative z-10">
        <h2 className="text-foreground text-2xl font-bold">
          {greeting}
          {name ? `, ${name}` : ''}
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Вот что происходит в вашей CRM сегодня
        </p>
      </div>
    </div>
  );
}
