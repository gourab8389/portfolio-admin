"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminApiInstance, PublicApiInstance } from "@/lib/apis";
import { Contact } from "@/types/object";

interface ContactResponse {
  success: boolean;
  message: string;
  data: Contact[];
}

const ContactList = () => {
  const { data: response, isLoading } = useQuery<ContactResponse>({
    queryKey: ["get-contacts"],
    queryFn: async () => {
      const response = await PublicApiInstance.get("/contacts");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-10">
        <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
      </div>
    );
  }
  return (
    <div className="">
      <div className="">
        {response?.data.map((contact) => (
          <div key={contact.id} className="p-4 mb-4 border rounded-md">
            <h3 className="text-lg font-semibold">{contact.name}</h3>
            <p className="text-sm text-gray-600">Email: {contact.email}</p>
            <p className="text-sm text-gray-600">Message: {contact.message}</p>
            <p className="text-xs text-gray-500">
              Received on: {new Date(contact.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
