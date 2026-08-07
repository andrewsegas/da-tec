import { cn } from "@/lib/utils";

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-primary/10 text-primary flex items-center justify-center overflow-hidden rounded-full font-semibold",
        className,
      )}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={`Avatar de ${name}`}
          className="size-full object-cover"
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
