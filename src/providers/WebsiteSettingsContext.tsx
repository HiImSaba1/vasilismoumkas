"use client";
import {createContext,useContext} from "react";
import type {WebsiteSettings} from "@/lib/website-settings";
const Context=createContext<WebsiteSettings|null>(null);
export function WebsiteSettingsProvider({value,children}:{value:WebsiteSettings;children:React.ReactNode}){return <Context.Provider value={value}>{children}</Context.Provider>}
export function useWebsiteSettings(){const value=useContext(Context);if(!value)throw new Error("Website settings are unavailable.");return value}
export function useOptionalWebsiteSettings(){return useContext(Context)}
