"use client";

import {
  Toaster,
  type ToastTheme,
  type ToasterProperties,
} from "@pheralb/toast";

import { useTheme } from "next-themes";

const ToasterNextTheme = (props: ToasterProperties) => {
  const { theme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        animationOnClose: "swipe",
      }}
      theme={theme as ToastTheme}
      maxToasts={1}
      {...props}
    />
  );
};

export default ToasterNextTheme;
