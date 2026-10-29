"use client";
import {useSyncExternalStore} from "react";
const subscribeHydration=()=>()=>{};
const client=()=>true;
const server=()=>false;
const subscribeViewport=(callback:()=>void)=>{window.addEventListener("resize",callback);return()=>window.removeEventListener("resize",callback);};
const desktop=()=>window.innerWidth>=1024;
export function useEducationMounted(){return useSyncExternalStore(subscribeHydration,client,server);}
export function useEducationDesktop(){return useSyncExternalStore(subscribeViewport,desktop,client);}
