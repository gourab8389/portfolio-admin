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
import { Loader2, Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminApiInstance, PublicApiInstance } from "@/lib/apis";
import { Education } from "@/types/object";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const educationSchema = z.object({
  educations: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, "Institute name is required"),
      stream: z.string().min(1, "Stream is required"),
      grade: z.string().min(1, "Grade is required"),
      degree: z.string().min(1, "Degree is required"),
      startDate: z.string().optional().refine(
        (val) => !val || /^\d{4}$/.test(val),
        { message: "Please enter a valid year (e.g., 2022)" }
      ),
      endDate: z.string().optional().refine(
        (val) => !val || /^\d{4}$/.test(val),
        { message: "Please enter a valid year (e.g., 2024)" }
      ),
    })
  ),
});

type EducationFormInputs = z.infer<typeof educationSchema>;

interface EducationApiResponse {
  success: boolean;
  message: string;
  data: Education[];
}

const EducationForm = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EducationFormInputs>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educations: [
        {
          name: "",
          stream: "",
          grade: "",
          degree: "",
          startDate: "",
          endDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  const { data: response, isLoading } = useQuery<EducationApiResponse>({
    queryKey: ["get-education"],
    queryFn: async () => {
      const response = await PublicApiInstance.get("/education");
      return response.data;
    },
  });

  useEffect(() => {
    if (response?.data && response.data.length > 0) {
      form.reset({
        educations: response.data.map((edu) => ({
          id: edu.id,
          name: edu.name,
          stream: edu.stream,
          grade: edu.grade,
          degree: edu.degree,
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
        })),
      });
    }
  }, [response, form]);

  const handleAddEducation = () => {
    append({
      name: "",
      stream: "",
      grade: "",
      degree: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleRemoveEducation = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: EducationFormInputs) => {
    setIsSaving(true);
    try {
      const originalData = response?.data || [];
      const originalIds = originalData.map((e) => e.id);
      const currentIds = data.educations
        .filter((e) => e.id)
        .map((e) => e.id) as number[];

      const idsToDelete = originalIds.filter((id) => !currentIds.includes(id));

      const deletionPromises = idsToDelete.map((id) =>
        AdminApiInstance.delete(`/education/${id}`)
      );

      const savePromises = data.educations.map((edu) => {
        const payload = {
          name: edu.name,
          stream: edu.stream,
          grade: edu.grade,
          degree: edu.degree,
          startDate: edu.startDate || undefined,
          endDate: edu.endDate || undefined,
        };

        if (edu.id) {
          return AdminApiInstance.put(`/education/${edu.id}`, payload);
        } else {
          return AdminApiInstance.post("/education", payload);
        }
      });

      await Promise.all([...deletionPromises, ...savePromises]);

      toast.success({ text: "Education updated successfully!" });
      router.refresh();

    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save education";
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
            <h2 className="text-xl font-semibold">Education Details</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddEducation}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Education
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
                    onClick={() => handleRemoveEducation(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}

                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Education {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`educations.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institute Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter institute name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`educations.${index}.degree`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter degree" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`educations.${index}.stream`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stream</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter stream" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`educations.${index}.grade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter grade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`educations.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2020"
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
                    name={`educations.${index}.endDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2024"
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

export default EducationForm;