import { AdminChrome } from "./AdminChrome";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listWorkflowReminders } from "@/lib/workflow-reminders";
import type {Metadata} from "next";

export const metadata:Metadata={robots:{index:false,follow:false,noarchive:true,nocache:true}};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const reminders=await isAdminAuthenticated()?await listWorkflowReminders():[];
  return <AdminChrome reminders={reminders}>{children}</AdminChrome>;
}
