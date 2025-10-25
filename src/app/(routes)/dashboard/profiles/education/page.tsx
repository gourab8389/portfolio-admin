import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EducationForm from "./_components/education-form";

export const metadata = {
  title: "Education Page | Dashboard",
};

const EducationPage = async () => {
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
        <EducationForm />
      </div>
    </PageContainer>
  );
};

export default EducationPage;
