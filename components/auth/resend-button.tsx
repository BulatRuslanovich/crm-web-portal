interface ResendButtonProps {
  onClick: () => void;
  loading: boolean;
  cooldown: number;
  labels?: {
    loading?: string;
    cooldown?: (secs: number) => string;
    idle?: string;
  };
}

export function ResendButton({
  onClick,
  loading,
  cooldown,
  labels = {},
}: ResendButtonProps) {
  const {
    loading: loadingLabel = 'Отправка...',
    cooldown: cooldownLabel = (s) => `Отправить повторно через ${s} сек`,
    idle: idleLabel = 'Отправить повторно',
  } = labels;

  const label = loading
    ? loadingLabel
    : cooldown > 0
      ? cooldownLabel(cooldown)
      : idleLabel;

  return (
    <button
      onClick={onClick}
      disabled={loading || cooldown > 0}
      className="mt-4 w-full cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-50 disabled:hover:text-muted-foreground"
    >
      {label}
    </button>
  );
}