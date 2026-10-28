import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

export default function Layout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#14243A" },
          headerTintColor: "#F3F5F8",
          contentStyle: { backgroundColor: "#F3F5F8" },
        }}
      />
    </QueryClientProvider>
  );
}
