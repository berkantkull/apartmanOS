export type AppRole = "owner" | "manager" | "resident" | "staff" | "security";

export type User = { displayName: string; email: string };
export type Membership = {
  community_id: string;
  role: AppRole;
  name: string;
  block_count: number;
  unit_count: number;
  unit: string | null;
};
export type Community = {
  id: string;
  name: string;
  block_count: number;
  unit_count: number;
  monthly_due: number;
  period: string;
  invite_code: string;
  due_day: number;
  payment_link: string | null;
};
export type Due = {
  id: string;
  resident_name: string;
  unit: string;
  amount: number;
  status: "pending" | "paid" | "late";
  due_date: string;
  period: string;
  paid_amount: number;
  balance: number;
  interest_amount: number;
};
export type Expense = { id: string; title: string; category: string; amount: number; expense_date: string };
export type Income = { id: string; title: string; category: string; amount: number; income_date: string };
export type Announcement = {
  id: string;
  title: string;
  body: string;
  kind: string;
  category: string;
  is_urgent: number;
  is_read: boolean;
  publish_at: string | null;
  created_at: string;
};
export type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "new" | "reviewing" | "in_progress" | "resolved" | "cancelled";
  created_at: string;
};
export type Meeting = { id: string; title: string; meeting_at: string; location: string; status: string };
export type PackageDelivery = {
  id: string;
  resident_name: string;
  unit_label: string;
  courier_company: string;
  status: "waiting" | "delivered";
  arrived_at: string;
};
export type Notification = { id: string; title: string; body: string; kind: string; read_at: string | null; created_at: string };
export type Invitation = { id: string; email: string; token: string; unit: string | null; phone: string | null; community_name?: string };

export type AppData = {
  user: User;
  membership: Membership | null;
  communities?: Membership[];
  community?: Community;
  dues?: Due[];
  expenses?: Expense[];
  incomes?: Income[];
  announcements?: Announcement[];
  requests?: MaintenanceRequest[];
  meetings?: Meeting[];
  deliveries?: PackageDelivery[];
  notifications?: Notification[];
  invitations?: Invitation[];
};

export type AuthPayload = {
  email: string;
  password: string;
  displayName?: string;
  phone?: string;
};
