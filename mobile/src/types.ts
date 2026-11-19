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
  creator_name: string;
  unit: string | null;
  request_type: "fault" | "request";
  title: string;
  description: string;
  category: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "new" | "reviewing" | "in_progress" | "resolved" | "cancelled";
  manager_note: string | null;
  created_at: string;
};
export type Meeting = { id: string; title: string; meeting_at: string; location: string; status: string };
export type PackageDelivery = {
  id: string;
  unit_id: string | null;
  resident_user_id: string | null;
  resident_name: string;
  unit_label: string;
  courier_company: string;
  tracking_number: string | null;
  status: "waiting" | "delivered";
  arrived_at: string;
  recipient_name: string | null;
  delivered_at: string | null;
  notes: string | null;
  reminder_count: number;
  last_reminder_at: string | null;
  created_by_name: string;
};
export type Member = { id: string; user_id: string; display_name: string; role: AppRole; unit: string | null };
export type Resident = { id: string; name: string; unit: string; source: "manual" | "member" };
export type PropertyUnit = { id: string; label: string; unit_no: string; owner_name: string | null; tenant_name: string | null };
export type PropertyData = { units: PropertyUnit[] };
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
  members?: Member[];
  residents?: Resident[];
  properties?: PropertyData;
  notifications?: Notification[];
  invitations?: Invitation[];
};

export type AuthPayload = {
  email: string;
  password: string;
  displayName?: string;
  phone?: string;
};
