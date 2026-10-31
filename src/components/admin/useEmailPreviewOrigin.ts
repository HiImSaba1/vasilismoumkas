"use client";
import {useSyncExternalStore} from "react";
const subscribe=()=>()=>{};
const browserOrigin=()=>window.location.origin;
const serverOrigin=()=>undefined;
// Local previews load local assets; sent messages still use the configured public origin.
export function useEmailPreviewOrigin(){return useSyncExternalStore(subscribe,browserOrigin,serverOrigin)}
