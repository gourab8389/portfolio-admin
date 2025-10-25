import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import EducationForm from "./_components/education-form";

export const metadata = {
  title: "Education Page | Dashboard",
};

const EducationPage = () => {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Education Details"
            description="Manage your education profile information"
          />
          <Link href="/dashboard/profiles/education/new">
            <Button size={"sm"}>
              Add New Education
              <PlusIcon className="ml-2" />
            </Button>
          </Link>
        </div>
        <Separator />
        <EducationForm />
      </div>
    </PageContainer>
  );
};

export default EducationPage;
