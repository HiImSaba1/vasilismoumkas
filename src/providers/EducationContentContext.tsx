"use client";
import {createContext,useContext} from "react";
import type {EducationContent} from "@/lib/education-content";
const Context=createContext<EducationContent|null>(null);
export const EducationContentProvider=Context.Provider;
export function useEducationContent(){const value=useContext(Context);if(!value)throw new Error("Education content provider is required.");return value;}
