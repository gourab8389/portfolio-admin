import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SkillForm from "./_components/skill-form";

export const metadata = {
  title: "Skill Page | Dashboard",
};

const SkillPage = async () => {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Skill Details"
            description="Manage your skill profile information"
          />
        </div>
        <Separator />
        <SkillForm />
      </div>
    </PageContainer>
  );
};

export default SkillPage;
