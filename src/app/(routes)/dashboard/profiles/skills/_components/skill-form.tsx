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
import { Skill } from "@/types/object";
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
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const categories = [
  "Programming Language",
  "Frontend Development",
  "Backend Development",
  "DevOps",
  "Cloud Computing",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Web Development",
  "UI/UX Design",
  "Project Management",
  "Testing & QA",
  "Version Control",
  "Cybersecurity",
  "Networking",
  "Agile & Scrum",
  "Database",
  "Other",
];

const skillSchema = z.object({
  skills: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, "Skill name is required"),
      proficiency: z.number().min(1).max(5),
      category: z.string().optional(),
    })
  ),
});

type SkillFormInputs = z.infer<typeof skillSchema>;

interface SkillApiResponse {
  success: boolean;
  message: string;
  data: Skill[];
}

const SkillForm = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SkillFormInputs>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skills: [
        {
          name: "",
          proficiency: 1,
          category: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const { data: response, isLoading } = useQuery<SkillApiResponse>({
    queryKey: ["get-skills"],
    queryFn: async () => {
      const response = await PublicApiInstance.get("/skills");
      return response.data;
    },
  });

  useEffect(() => {
    if (response?.data && response.data.length > 0) {
      form.reset({
        skills: response.data.map((edu) => ({
          id: edu.id,
          name: edu.name,
          proficiency: edu.proficiency,
          category: edu.category || "",
        })),
      });
    }
  }, [response, form]);

  const handleAddSkill = () => {
    append({
      name: "",
      proficiency: 1,
      category: "",
    });
  };

  const handleRemoveSkill = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: SkillFormInputs) => {
    setIsSaving(true);
    try {
      const originalData = response?.data || [];
      const originalIds = originalData.map((e) => e.id);
      const currentIds = data.skills
        .filter((e) => e.id)
        .map((e) => e.id) as number[];

      const idsToDelete = originalIds.filter((id) => !currentIds.includes(id));

      const deletionPromises = idsToDelete.map((id) =>
        AdminApiInstance.delete(`/skills/${id}`)
      );

      const savePromises = data.skills.map((edu) => {
        const payload = {
          name: edu.name,
          proficiency: edu.proficiency,
          category: edu.category,
        };

        if (edu.id) {
          return AdminApiInstance.put(`/skills/${edu.id}`, payload);
        } else {
          return AdminApiInstance.post("/skills", payload);
        }
      });

      await Promise.all([...deletionPromises, ...savePromises]);

      toast.success({ text: "Skill updated successfully!" });
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save skill";
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
            <h2 className="text-xl font-semibold">Skill Details</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSkill}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
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
                    onClick={() => handleRemoveSkill(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Skill {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`skills.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter skill name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`skills.${index}.proficiency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proficiency</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter proficiency out of 5"
                            type="number"
                            min={0}
                            max={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`skills.${index}.category`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
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

export default SkillForm;
