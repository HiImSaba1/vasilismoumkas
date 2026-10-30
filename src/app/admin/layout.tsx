import { AdminChrome } from "./AdminChrome";
import {isAdminAuthenticated} from "@/lib/admin-auth";
import {listNewActivity} from "@/lib/new-activity";


import type {Metadata} from "next";

export const metadata:Metadata={robots:{index:false,follow:false,noarchive:true,nocache:true}};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

  const notifications=await isAdminAuthenticated()?await listNewActivity():[];
  return <AdminChrome notifications={notifications}>{children}</AdminChrome>;
}
