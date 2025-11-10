import Heading from "@/components/heading";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import ContactList from "./_components/contact-list";

export const metadata = {
  title: "Contacts Page | Dashboard",
};

const Contacts = () => {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Contacts" description="List contacts informations" />
        </div>
        <Separator />
      <ContactList />
      </div>
    </PageContainer>
  );
};

export default Contacts;
