"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff, Trash2, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { AdminApiInstance } from "@/lib/apis";
import { Contact } from "@/types/object";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@pheralb/toast";

interface ContactResponse {
  success: boolean;
  message: string;
  data: Contact[];
}

const ContactList = () => {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const { data: response, isLoading } = useQuery<ContactResponse>({
    queryKey: ["get-contacts"],
    queryFn: async () => {
      const response = await AdminApiInstance.get("/contacts");
      return response.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await AdminApiInstance.put(`/contacts/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-contacts"] });
      toast.success({ text: "Contact marked as read" });
      setMessageDialogOpen(false);
      setSelectedContact(null);
    },
    onError: (error: any) => {
      toast.error({
        text: error.response?.data?.message || "Failed to mark as read",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await AdminApiInstance.delete(`/contacts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-contacts"] });
      toast.success({ text: "Contact deleted successfully" });
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    },
    onError: (error: any) => {
      toast.error({
        text: error.response?.data?.message || "Failed to delete contact",
      });
    },
  });

  const handleShowMessage = (contact: Contact) => {
    setSelectedContact(contact);
    setMessageDialogOpen(true);
  };

  const handleMarkAsRead = () => {
    if (selectedContact) {
      markAsReadMutation.mutate(selectedContact.id);
    }
  };

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete.id);
    }
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
          {!row.original.isRead && (
            <Badge variant="default" className="text-xs">
              New
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "message",
      header: "Message",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShowMessage(row.original)}
        >
          <Mail className="mr-2 h-4 w-4" />
          Show Message
        </Button>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="icon"
          onClick={() => handleDeleteClick(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: response?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (isLoading) {
    return (
      <Card className="p-10">
        <div className="flex w-full items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (response?.data.length === 0) {
    return (
      <Card className="p-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">
            No contacts found
          </p>
          <p className="text-sm text-muted-foreground">
            Contact submissions will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Contacts List</h2>
            </div>
            <Badge variant="secondary" className="text-sm">
              {response?.data.length} Total
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter by name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <div className="min-w-[640px]">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={!row.original.isRead ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30" : ""}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Message from {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              Received on{" "}
              {selectedContact?.createdAt &&
                new Date(selectedContact.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-sm">{selectedContact?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Message
              </label>
              <div className="mt-2 rounded-md border p-4 bg-muted/50">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedContact?.message || "No message provided"}
                </p>
              </div>
            </div>

            {selectedContact && !selectedContact.isRead && (
              <Badge variant="default">Unread</Badge>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMessageDialogOpen(false)}
            >
              Close
            </Button>
            {selectedContact && !selectedContact.isRead && (
              <Button
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
              >
                {markAsReadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Mark as Read
                  </>
                )}
              </Button>
            )}
            {selectedContact && selectedContact.isRead && (
              <Badge variant="secondary" className="gap-2">
                <EyeOff className="h-4 w-4" />
                Already Read
              </Badge>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact from{" "}
              <span className="font-semibold">{contactToDelete?.name}</span> (
              {contactToDelete?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteContactMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteContactMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContactList;