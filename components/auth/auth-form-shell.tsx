interface AuthFormShellProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthFormShell({ title, subtitle, children, footer }: AuthFormShellProps) {
  return (
    <div className="p-6">
      <h2 className="mb-1 text-xl font-bold text-foreground">{title}</h2>
      <p className="mb-5 text-sm text-muted-foreground">{subtitle}</p>
      {children}
      {footer && (
        <div className="mt-5 border-t pt-5 text-center text-sm">{footer}</div>
      )}
    </div>
  );
}