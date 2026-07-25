"use client";

import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

export function NativeInit() {
  useEffect(() => {
    async function initNativeFeatures() {
      if (!Capacitor.isNativePlatform()) return;
      
      try {
        // Set the status bar to a dark cosmic color (e.g., #0B0F19 - AstroMind dark theme background)
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0B0F19" });
      } catch (err) {
        console.log("StatusBar plugin not available", err);
      }
      
      try {
        // Hide the splash screen after the React app has mounted
        await SplashScreen.hide();
      } catch (err) {
        console.log("SplashScreen plugin not available", err);
      }
    }
    
    initNativeFeatures();
  }, []);
  
  return null;
}
