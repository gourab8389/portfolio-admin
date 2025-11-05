"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminApiInstance, PublicApiInstance } from "@/lib/apis";
import { Experience } from "@/types/object";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface CreateExperienceRequest {
  organizationName: string;
  organizationImage?: string;
  role: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  type: 'organization' | 'internship' | 'college_event';
}

const experienceSchema = z.object({
  experiences: z.array(
    z.object({
      id: z.number().optional(),
      organizationName: z.string().min(1, "Organization name is required"),
      organizationImage: z.string().optional(),
      role: z.string().min(1, "Role is required"),
      description: z.string().min(1, "Description is required"),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      type: z.enum(['organization', 'internship', 'college_event']).optional(),
    })
  ),
});

type ExperienceFormInputs = z.infer<typeof experienceSchema>;

interface ExperienceApiResponse {
  success: boolean;
  message: string;
  data: Experience[];
}

const ExperienceForm = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ExperienceFormInputs>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experiences: [
        {
          organizationName: "",
          organizationImage: "",
          role: "",
          description: "",
          startDate: "",
          endDate: "",
          type: 'organization',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const { data: response, isLoading } = useQuery<ExperienceApiResponse>({
    queryKey: ["get-experiences"],
    queryFn: async () => {
      const response = await PublicApiInstance.get("/experiences");
      return response.data;
    },
  });

  useEffect(() => {
    if (response?.data && response.data.length > 0) {
      form.reset({
        experiences: response.data.map((edu) => ({
          id: edu.id,
          organizationName: edu.organizationName,
          organizationImage: edu.organizationImage || "",
          role: edu.role,
          description: edu.description || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          type: edu.type || 'organization',
        })),
      });
    }
  }, [response, form]);

  const handleAddExperience = () => {
    append({
      organizationName: "",
      organizationImage: "",
      role: "",
      description: "",
      startDate: "",
      endDate: "",
      type: 'organization',
    });
  };

  const handleRemoveExperience = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: ExperienceFormInputs) => {
    setIsSaving(true);
    try {
      const originalData = response?.data || [];
      const originalIds = originalData.map((e) => e.id);
      const currentIds = data.experiences
        .filter((e) => e.id)
        .map((e) => e.id) as number[];

      const idsToDelete = originalIds.filter((id) => !currentIds.includes(id));

      const deletionPromises = idsToDelete.map((id) =>
        AdminApiInstance.delete(`/experiences/${id}`)
      );

      const savePromises = data.experiences.map((edu) => {
        const payload = {
          organizationName: edu.organizationName,
          organizationImage: edu.organizationImage,
          role: edu.role,
          description: edu.description,
          startDate: edu.startDate,
          endDate: edu.endDate,
          type: edu.type,
        };

        if (edu.id) {
          return AdminApiInstance.put(`/experiences/${edu.id}`, payload);
        } else {
          return AdminApiInstance.post("/experiences", payload);
        }
      });

      await Promise.all([...deletionPromises, ...savePromises]);

      toast.success({ text: "Experience updated successfully!" });
      router.refresh();

    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save experience";
      toast.error({ text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Experience Details</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddExperience}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative border rounded-lg p-5 bg-card"
              >
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8"
                    onClick={() => handleRemoveExperience(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Experience {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`experiences.${index}.organizationName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.organizationImage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Image</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="internship">Internship</SelectItem>
                                <SelectItem value="organization">Organization</SelectItem>
                                <SelectItem value="college_event">College Event</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter role" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 03,2020"
                            maxLength={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.endDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 03,2024"
                            maxLength={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving || !form.formState.isDirty}
              className="w-fit"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default ExperienceForm;