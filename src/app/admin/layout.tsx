import { AdminChrome } from "./AdminChrome";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listWorkflowReminders } from "@/lib/workflow-reminders";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const reminders=await isAdminAuthenticated()?await listWorkflowReminders():[];
  return <AdminChrome reminders={reminders}>{children}</AdminChrome>;
}
