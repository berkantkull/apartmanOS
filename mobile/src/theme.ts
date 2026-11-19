export const colors = {
  navy: "#062B50",
  navyLight: "#073B73",
  blue: "#087BDE",
  cyan: "#0A9BF2",
  ice: "#EAF5FF",
  cloud: "#F4F8FC",
  ink: "#0B2340",
  muted: "#67809B",
  line: "#DCE7F1",
  white: "#FFFFFF",
  success: "#0D9F6E",
  successSoft: "#E8F8F2",
  warning: "#D8890B",
  warningSoft: "#FFF5DF",
  danger: "#D94747",
  dangerSoft: "#FFF0F0",
};

export const shadow = {
  shadowColor: "#062B50",
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};

export const roleNames = {
  owner: "Yönetim sahibi",
  manager: "Yönetici",
  resident: "Sakin",
  staff: "Personel",
  security: "Güvenlik",
} as const;

export const money = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(value));
