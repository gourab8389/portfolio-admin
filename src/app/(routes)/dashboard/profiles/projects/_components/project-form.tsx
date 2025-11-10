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
import { Project } from "@/types/object";
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
import { TagInput } from "@/components/ui/tag-input";

export type ProjectType = "personal" | "client" | "academic" | "internship";

const projectSchema = z.object({
  projects: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, "Project name is required"),
      type: z.enum(["personal", "client", "academic", "internship"]),
      image: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      githubLinks: z.array(
        z.object({
          name: z.string().min(1, "Link name is required"),
          url: z.string().min(1, "Link URL is required").url("Invalid URL"),
        })
      ),
      projectLinks: z.array(
        z.object({
          name: z.string().min(1, "Link name is required"),
          url: z.string().min(1, "Link URL is required").url("Invalid URL"),
        })
      ),
      technologies: z.array(z.string()).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ),
});

type ProjectFormInputs = z.infer<typeof projectSchema>;

interface ProjectApiResponse {
  success: boolean;
  message: string;
  data: Project[];
}

const ProjectForm = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProjectFormInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projects: [
        {
          name: "",
          type: "personal" as ProjectType,
          image: "",
          description: "",
          githubLinks: [],
          projectLinks: [],
          technologies: [],
          startDate: "",
          endDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const { data: response, isLoading } = useQuery<ProjectApiResponse>({
    queryKey: ["get-projects"],
    queryFn: async () => {
      const response = await PublicApiInstance.get("/projects");
      return response.data;
    },
  });

  useEffect(() => {
    if (response?.data && response.data.length > 0) {
      form.reset({
        projects: response.data.map((edu) => ({
          id: edu.id,
          name: edu.name,
          type: edu.type,
          image: edu.image,
          description: edu.description,
          githubLinks: edu.githubLinks.map((link) => ({ name: "", url: link })),
          projectLinks: edu.projectLinks.map((link) => ({
            name: "",
            url: link,
          })),
          technologies: edu.technologies || [],
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
        })),
      });
    }
  }, [response, form]);

  const handleAddProject = () => {
    append({
      name: "",
      type: "personal" as ProjectType,
      image: "",
      description: "",
      githubLinks: [],
      projectLinks: [],
      technologies: [],
      startDate: "",
      endDate: "",
    });
  };

  const handleRemoveProject = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: ProjectFormInputs) => {
    setIsSaving(true);
    try {
      const originalData = response?.data || [];
      const originalIds = originalData.map((e) => e.id);
      const currentIds = data.projects
        .filter((e) => e.id)
        .map((e) => e.id) as number[];

      const idsToDelete = originalIds.filter((id) => !currentIds.includes(id));

      const deletionPromises = idsToDelete.map((id) =>
        AdminApiInstance.delete(`/projects/${id}`)
      );

      const savePromises = data.projects.map((edu) => {
        const payload = {
          name: edu.name,
          type: edu.type,
          image: edu.image,
          description: edu.description,
          githubLinks: edu.githubLinks.map((link) => link.url),
          projectLinks: edu.projectLinks.map((link) => link.url),
          technologies: edu.technologies || [],
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
        };

        if (edu.id) {
          return AdminApiInstance.put(`/projects/${edu.id}`, payload);
        } else {
          return AdminApiInstance.post("/projects", payload);
        }
      });

      await Promise.all([...deletionPromises, ...savePromises]);

      toast.success({ text: "Project updated successfully!" });
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save project";
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
            <h2 className="text-xl font-semibold">Project Details</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddProject}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Project
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
                    onClick={() => handleRemoveProject(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  Project {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`projects.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Type</SelectLabel>
                                <SelectItem value="personal">
                                  Personal
                                </SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="academic">
                                  Academic
                                </SelectItem>
                                <SelectItem value="internship">
                                  Internship
                                </SelectItem>
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
                    name={`projects.${index}.image`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Project Image URL</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter project image URL"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter project description"
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
                    name={`projects.${index}.githubLinks`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>GitHub Links</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value?.map((link) => link.url) || []}
                            onChange={(urls) => {
                              field.onChange(
                                urls.map((url) => ({ name: "", url }))
                              );
                            }}
                            placeholder="Paste GitHub URL and press Enter"
                            validator={(value) => {
                              try {
                                new URL(value);
                                return true;
                              } catch {
                                return false;
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.projectLinks`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Project Links</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value?.map((link) => link.url) || []}
                            onChange={(urls) => {
                              field.onChange(
                                urls.map((url) => ({ name: "", url }))
                              );
                            }}
                            placeholder="Paste project URL and press Enter"
                            validator={(value) => {
                              try {
                                new URL(value);
                                return true;
                              } catch {
                                return false;
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.technologies`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Technologies</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Type a technology and press Enter"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 03,2024"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.endDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 03,2024"
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

export default ProjectForm;
