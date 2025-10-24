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
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdminApiInstance, PublicApiInstance } from "@/lib/apis";
import { Textarea } from "@/components/ui/textarea";
import { Profile } from "@/types/object";

const profileSchema = zod.object({
  email: zod.string().email(),
  name: zod.string().min(2),
  phoneNumber: zod.string().min(10).optional(),
  address: zod.string().optional(),
  bio: zod.string().optional(),
  location: zod.string().optional(),
  website: zod.string().optional().or(zod.literal("")),
  linkedinUrl: zod.string().optional().or(zod.literal("")),
  githubUrl: zod.string().optional().or(zod.literal("")),
  twitterUrl: zod.string().optional().or(zod.literal("")),
  profileImage: zod.string().optional().or(zod.literal("")),
  resume: zod.string().optional().or(zod.literal("")),
});

type ProfileFormInputs = zod.infer<typeof profileSchema>;

interface ProfileApiResponse {
  success: boolean;
  message: string;
  data: Profile | null;
}

const DetailsFormPage = () => {
  const router = useRouter();

  const { data: response, isLoading } = useQuery<ProfileApiResponse>({
    queryKey: ["get-profile"],
    queryFn: async () => {
      const response = await PublicApiInstance.get("/profile");
      const data = response.data;
      return data;
    },
  });

  const profile = response?.data;

  console.log(profile);

  const form = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: profile?.email || "",
      name: profile?.name || "",
      phoneNumber: profile?.phoneNumber || "",
      address: profile?.address || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
      linkedinUrl: profile?.linkedinUrl || "",
      githubUrl: profile?.githubUrl || "",
      twitterUrl: profile?.twitterUrl || "",
      profileImage: profile?.profileImage || "",
      resume: profile?.resume || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        email: profile?.email || "",
        name: profile?.name || "",
        phoneNumber: profile?.phoneNumber || "",
        address: profile?.address || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
        website: profile?.website || "",
        linkedinUrl: profile?.linkedinUrl || "",
        githubUrl: profile?.githubUrl || "",
        twitterUrl: profile?.twitterUrl || "",
        profileImage: profile?.profileImage || "",
        resume: profile?.resume || "",
      });
    }
  }, [profile, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ProfileFormInputs) => {
      const res = await AdminApiInstance.post("/profile", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success({ text: "Profile updated successfully!" });
      } else {
        toast.error({ text: data.message || "Profile update failed" });
      }
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Profile update failed";
      toast.error({ text: errorMessage });
    },
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data: ProfileFormInputs) => {
      const res = await AdminApiInstance.put(`/profile/${profile?.id}`, data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success({ text: "Profile updated successfully!" });
      } else {
        toast.error({ text: data.message || "Profile update failed" });
      }
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Profile update failed";
      toast.error({ text: errorMessage });
    },
  });

  const onSubmit = (data: ProfileFormInputs) => {
    if (profile) {
      updateProfile(data);
    } else {
      mutate(data);
    }
  };


  return (
    <Card className="p-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="LinkedIn URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="GitHub URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Twitter URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Profile Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Resume URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Address"
                    {...field}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Bio"
                    {...field}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isPending || isUpdating || !form.formState.isDirty}
            className="w-fit self-end"
          >
            {isPending || isUpdating ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default DetailsFormPage;
