"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@pheralb/toast";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { AuthApiInstance } from "@/lib/apis";

const loginSchema = zod.object({
  email: zod
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuth();
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, router]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: LoginFormInputs) => {
      const res = await AuthApiInstance.post("/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const { token, admin } = data.data;

        setAuth(token, {
          email: admin.email,
          role: "admin",
        });

        toast.success({ text: "Login successful!" });
        window.location.href = "/dashboard";
      } else {
        toast.error({ text: data.message || "Login failed" });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error({ text: errorMessage });
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    mutate(data);
  };

  return (
    <div className="w-full min-h-screen flex items-center px-5 md:px-14 max-w-screen-2xl mx-auto justify-center">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type={passwordVisibility ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
