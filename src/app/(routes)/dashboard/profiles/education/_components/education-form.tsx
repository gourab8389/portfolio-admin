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
import { Education } from "@/types/object";
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";

const educationSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  stream: zod.string().min(1, "Stream is required"),
  grade: zod.string().min(1, "Grade is required"),
  degree: zod.string().min(1, "Degree is required"),
  startDate: zod.string().optional(),
  endDate: zod.string().optional(),
});

type EducationFormInputs = zod.infer<typeof educationSchema>;

interface EducationApiResponse {
  success: boolean;
  message: string;
  data: Education | null;
}

const EducationForm = () => {
  const router = useRouter();

  const { data: response, isLoading } = useQuery<EducationApiResponse>({
    queryKey: ["get-education"],
    queryFn: async () => {
      const response = await PublicApiInstance.get("/education");
      const data = response.data;
      return data;
    },
  });

  const education = response?.data;

  console.log(education);

  const form = useForm<EducationFormInputs>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      name: "",
      stream: "",
      grade: "",
      degree: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (education) {
      form.reset({
        name: education.name,
        stream: education.stream,
        grade: education.grade,
        degree: education.degree,
        startDate: education.startDate,
        endDate: education.endDate,
      });
    }
  }, [education, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: EducationFormInputs) => {
      const res = await AdminApiInstance.post("/education", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success({ text: "Education updated successfully!" });
      } else {
        toast.error({ text: data.message || "Education update failed" });
      }
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Education update failed";
      toast.error({ text: errorMessage });
    },
  });

  const { mutate: updateEducation, isPending: isUpdating } = useMutation({
    mutationFn: async (data: EducationFormInputs) => {
      const res = await AdminApiInstance.put(
        `/education/${education?.id}`,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success({ text: "Education updated successfully!" });
      } else {
        toast.error({ text: data.message || "Education update failed" });
      }
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Education update failed";
      toast.error({ text: errorMessage });
    },
  });

  const onSubmit = (data: EducationFormInputs) => {
    if (education) {
      updateEducation(data);
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
                  <FormLabel>Institute Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="Degree" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream</FormLabel>
                  <FormControl>
                    <Input placeholder="Stream" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="Grade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select end date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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

export default EducationForm;
