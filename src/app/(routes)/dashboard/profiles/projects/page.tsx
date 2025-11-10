import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import ProjectForm from "./_components/project-form";

export const metadata = {
  title: "Project Page | Dashboard",
};

const ProjectPage = async () => {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Project Details"
            description="Manage your project profile information"
          />
        </div>
        <Separator />
        <ProjectForm />
      </div>
    </PageContainer>
  );
};

export default ProjectPage;
