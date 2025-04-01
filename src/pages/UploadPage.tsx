
import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fileService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";

interface FileUploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const newFileStates: FileUploadState[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));
    
    setFiles((prev) => [...prev, ...newFileStates]);
  };

  const removeFile = (fileToRemove: FileUploadState) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const uploadFile = async (fileState: FileUploadState) => {
    const formData = new FormData();
    formData.append("file", fileState.file);
    
    try {
      // Update state to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f === fileState ? { ...f, status: "uploading" } : f
        )
      );
      
      // Start upload with progress tracking
      await fileService.uploadFile(formData, (progress) => {
        setFiles((prev) =>
          prev.map((f) =>
            f === fileState ? { ...f, progress } : f
          )
        );
      });
      
      // Update state to success
      setFiles((prev) =>
        prev.map((f) =>
          f === fileState ? { ...f, status: "success", progress: 100 } : f
        )
      );
      
      toast.success(`${fileState.file.name} uploaded successfully`);
    } catch (error) {
      // Update state to error
      setFiles((prev) =>
        prev.map((f) =>
          f === fileState
            ? {
                ...f,
                status: "error",
                errorMessage: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
      
      toast.error(`Failed to upload ${fileState.file.name}`);
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    
    if (pendingFiles.length === 0) {
      toast.info("No files to upload");
      return;
    }
    
    // Upload each file sequentially to avoid overwhelming the server
    for (const fileState of pendingFiles) {
      await uploadFile(fileState);
    }
    
    // After all uploads, check if we should navigate away
    const allSuccessful = files.every((f) => f.status === "success");
    
    if (allSuccessful) {
      toast.success("All files uploaded successfully");
      setTimeout(() => navigate("/files"), 1500);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Upload Files</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardDescription>
            Drag and drop files or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? "file-drag-active" : "border-gray-200"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileInputChange}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                {isDragging ? "Drop files here" : "Drag and drop files here"}
              </h3>
              <p className="text-sm text-muted-foreground">
                or <span className="text-filehub font-medium">browse</span> to
                upload
              </p>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="font-medium">Files</div>
              <div className="space-y-2">
                {files.map((fileState, index) => (
                  <div
                    key={`${fileState.file.name}-${index}`}
                    className="flex items-center space-x-4 rounded-md border p-4"
                  >
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">
                          {fileState.file.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          {fileState.status === "success" && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {fileState.status === "error" && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(fileState);
                            }}
                            disabled={fileState.status === "uploading"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(fileState.file.size)}
                      </p>
                      {fileState.status === "uploading" && (
                        <div className="pt-2">
                          <Progress value={fileState.progress} className="h-1" />
                        </div>
                      )}
                      {fileState.status === "error" && (
                        <p className="text-xs text-red-500">
                          {fileState.errorMessage || "Upload failed"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                  disabled={files.some((f) => f.status === "uploading")}
                >
                  Clear All
                </Button>
                <Button className="bg-filehub hover:bg-filehub-dark" onClick={uploadAllFiles}>
                  Upload {files.filter((f) => f.status === "pending").length} Files
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
