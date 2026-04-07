import PageContainer from "@/components/layout/page-container";
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
