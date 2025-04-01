import React, { useState, useEffect } from "react";
import { fileService } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  MoreVertical,
  Trash2,
  FileText,
  Image,
  FileAudio,
  FileVideo,
  File,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { formatBytes, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface FileItem {
  id: number;
  filename: string;
  file_type: string;
  size: number;
  upload_date: string;
  file_url: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("image")) return <Image size={20} />;
  if (fileType.includes("audio")) return <FileAudio size={20} />;
  if (fileType.includes("video")) return <FileVideo size={20} />;
  if (fileType.includes("pdf") || fileType.includes("text")) return <FileText size={20} />;
  return <File size={20} />;
};

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof FileItem>("upload_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const data = await fileService.getFiles();
      // Transform the data to match your component's expected structure
      const transformedData = data.map((file: any) => ({
        id: file.id,
        filename: file.file_name.split('/').pop() || file.file_name, // Extract actual filename
        file_type: getFileTypeFromUrl(file.file), // Determine file type
        size: file.file_size || 0, // Use the correct field from the API response
        upload_date: file.uploaded_at,
        file_url: file.file,
      }));
      setFiles(transformedData);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast.error("Failed to load your files");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine file type from URL
  const getFileTypeFromUrl = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (!extension) return "application/octet-stream";
    
    switch (extension) {
      case 'pdf': return "application/pdf";
      case 'jpg': return "image/jpeg";
      case 'jpeg': return "image/jpeg";
      case 'png': return "image/png";
      case 'txt': return "text/plain";
      // Add more types as needed
      case 'mp3': return "audio/mpeg";
      case 'wav': return "audio/wav";
      case 'mp4': return "video/mp4";
      default: return "application/octet-stream";
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSort = (field: keyof FileItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      await fileService.deleteFile(fileToDelete.id);
      setFiles(files.filter((file) => file.id !== fileToDelete.id));
      toast.success(`${fileToDelete.filename} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    }
    setFileToDelete(null);
  };

  const handleDownload = (file: FileItem) => {
    try {
      fileService.downloadFile(file.id);
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  const getSortIndicator = (field: keyof FileItem) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortField === "size") {
      return sortDirection === "asc" ? a.size - b.size : b.size - a.size;
    }
    
    if (sortField === "upload_date") {
      return sortDirection === "asc" 
        ? new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
        : new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
    }
    
    const aValue = a[sortField].toString().toLowerCase();
    const bValue = b[sortField].toString().toLowerCase();
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const filteredFiles = sortedFiles.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Files</h1>
        <Button asChild className="bg-filehub hover:bg-filehub-dark">
          <a href="/upload">Upload Files</a>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("file_type")}
                    >
                      Type{getSortIndicator("file_type")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("size")}
                    >
                      Size{getSortIndicator("size")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("upload_date")}
                    >
                      Uploaded{getSortIndicator("upload_date")}
                    </TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="text-muted-foreground">
                            {getFileIcon(file.file_type)}
                          </div>
                          <span className="truncate max-w-[200px]">
                            {file.filename}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{file.file_type.split("/")[1] || file.file_type}</TableCell>
                      <TableCell>{formatBytes(file.size)}</TableCell>
                      <TableCell>{formatDate(file.upload_date)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(file)}>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setFileToDelete(file)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No files found</h3>
              <p className="text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload your first file to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">{fileToDelete?.filename}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FilesPage;
