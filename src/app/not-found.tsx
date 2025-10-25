import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const NotfoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-lg mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/dashboard">
        <Button variant={"outline"}>Go to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotfoundPage;
