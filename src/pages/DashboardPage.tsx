import React, { useState, useEffect } from "react";
import { fileService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { formatBytes, formatDate } from "@/lib/utils";
import { FileText, HardDrive, Upload, FileType2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface DashboardStats {
  total_files: number;
  total_storage_used: number;
  recent_uploads: {
    id: number;
    filename: string;
    size: number;
    upload_date: string;
    file_type: string;
  }[];
  file_type_distribution: {
    file_type: string;
    count: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#0EA5E9'];

const getFileIcon = (fileType: string) => {
  if (fileType.includes("image")) return "🖼️";
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("word") || fileType.includes("document")) return "📝";
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📊";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📽️";
  if (fileType.includes("text")) return "📋";
  if (fileType.includes("zip") || fileType.includes("compress")) return "🗜️";
  if (fileType.includes("audio")) return "🎵";
  if (fileType.includes("video")) return "🎬";
  return "📁";
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await fileService.getDashboardStats();

        // Transform recent_uploads to match component's expected structure
        const transformedRecentUploads = (data.recent_uploads || []).map((file) => {
          const filename = file.file_name.split('/').pop() || file.file_name;
          const extension = filename.split('.').pop()?.toLowerCase() || '';

          // Determine file type based on extension
          let file_type = 'unknown';
          if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) file_type = 'image';
          else if (extension === 'pdf') file_type = 'pdf';
          else if (['doc', 'docx'].includes(extension)) file_type = 'document';
          else if (['xls', 'xlsx'].includes(extension)) file_type = 'spreadsheet';
          else if (['ppt', 'pptx'].includes(extension)) file_type = 'presentation';
          else if (extension === 'txt') file_type = 'text';
          else if (['zip', 'rar', '7z'].includes(extension)) file_type = 'compressed';
          else if (['mp3', 'wav'].includes(extension)) file_type = 'audio';
          else if (['mp4', 'avi', 'mov'].includes(extension)) file_type = 'video';

          return {
            id: file.id,
            filename: filename,
            size: file.file_size || 0, // Use the correct field from the API response
            upload_date: file.uploaded_at,
            file_type: file_type,
          };
        });

        // Recalculate file_type_distribution based on transformed recent_uploads
        const recalculatedFileTypeDistribution = transformedRecentUploads.reduce((acc, file) => {
          acc[file.file_type] = (acc[file.file_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const recalculatedFileTypeDistributionArray = Object.entries(recalculatedFileTypeDistribution).map(
          ([file_type, count]) => ({
            file_type,
            count,
          })
        );

        // Create transformed data structure
        const transformedData = {
          ...data,
          file_type_distribution: recalculatedFileTypeDistributionArray,
          recent_uploads: transformedRecentUploads,
        };

        setStats(transformedData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-filehub mr-2" />
              <div className="text-3xl font-bold">{stats?.total_files || 0}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <HardDrive className="h-6 w-6 text-filehub mr-2" />
              <div className="text-3xl font-bold">{formatBytes(stats?.total_storage_used || 0)}</div>
            </div>
            {user?.storage_limit && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-filehub rounded-full" 
                    style={{ 
                      width: `${Math.min(100, ((stats?.total_storage_used || 0) / user.storage_limit) * 100)}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatBytes(stats?.total_storage_used || 0)} of {formatBytes(user.storage_limit)} used
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">File Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileType2 className="h-6 w-6 text-filehub mr-2" />
              <div className="text-3xl font-bold">{stats?.file_type_distribution?.length || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.file_type_distribution && stats.file_type_distribution.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.file_type_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ file_type }) => file_type}
                    >
                      {stats.file_type_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} files`, props.payload.file_type]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No file data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_uploads && stats.recent_uploads.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_uploads.map((file) => (
                  <div key={file.id} className="flex items-start p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="text-2xl mr-3">{getFileIcon(file.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.filename}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} • {formatDate(file.upload_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No recent uploads
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
