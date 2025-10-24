import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import DetailsFormPage from "./_components/details-form";

export const metadata = {
  title: "Details Page | Dashboard",
};

const DetailsPage = () => {
  return (
    <PageContainer scrollable={true}>
        <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Admin Details"
            description="Manage your admin profile information"
          />
        </div>
        <Separator />
        <DetailsFormPage />
      </div>
    </PageContainer>
  )
}

export default DetailsPage;
