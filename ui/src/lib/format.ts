export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value}%`;
}

export function formatRole(role: string): string {
  switch (role) {
    case "director":
      return "Director";
    case "officer":
      return "Officer";
    case "director_and_officer":
      return "Director & Officer";
    default:
      return role;
  }
}

export function formatAccountType(type: string): string {
  switch (type) {
    case "corporate_chequing":
      return "Cash";
    case "corporate_investing":
      return "Investment";
    default:
      return type;
  }
}
