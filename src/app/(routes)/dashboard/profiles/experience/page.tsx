import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ExperienceForm from "./_components/experience-form";

export const metadata = {
  title: "Experience Page | Dashboard",
};

const ExperiencePage = async () => {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Education Details"
            description="Manage your education profile information"
          />
        </div>
        <Separator />
        <ExperienceForm />
      </div>
    </PageContainer>
  );
};

export default ExperiencePage;
