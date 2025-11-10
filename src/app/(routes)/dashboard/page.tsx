import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import DetailsPage from "./_components/details-page";

const metadata = {
  title: "Dashboard Page",
};

const DashboardPage = () => {
  return (
    <PageContainer scrollable={true}>
        <DetailsPage />
    </PageContainer>
  );
};

export default DashboardPage;
