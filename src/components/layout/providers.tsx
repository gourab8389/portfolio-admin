"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
// import { ThemeProvider } from "next-themes";
import { PropsWithChildren, useState } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ToasterNextTheme from "../shared/toast-provider";

export const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            let errorMessage: string;
            if (err instanceof Error) {
              errorMessage = err.message;
            } else {
              errorMessage = "An unknown error occurred.";
            }
            console.log(errorMessage);
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        > */}
          {children}
          {/* <ToasterNextTheme /> */}
        {/* </ThemeProvider> */}
      </NuqsAdapter>
    </QueryClientProvider>
  );
};
