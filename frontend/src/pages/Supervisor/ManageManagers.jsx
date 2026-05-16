import React, { useState, useEffect } from 'react';
import { SupervisorLayout } from '@/components/supervisor-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  IconSearch,
  IconDownload,
  IconUsers,
  IconRefresh,
  IconFolder,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { projectAPI, reportAPI } from '@/utils/api';

const ManageManagers = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    filterManagers();
  }, [managers, searchTerm]);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      
      // Get all projects created by this supervisor
      const projectsData = await projectAPI.getProjects();
      const supervisorProjects = projectsData.projects || [];
      
      // Extract all unique manager IDs from supervisor projects
      const managerIdsSet = new Set();
      const projectsByManager = new Map();
      const tasksByManager = new Map();
      
      supervisorProjects.forEach(project => {
        if (project.assignedTo && Array.isArray(project.assignedTo)) {
          project.assignedTo.forEach(manager => {
            const managerId = manager._id || manager;
            managerIdsSet.add(managerId);
            
            // Track projects by manager
            if (!projectsByManager.has(managerId)) {
              projectsByManager.set(managerId, []);
            }
            projectsByManager.get(managerId).push(project);
            
            // Track tasks by manager from their projects
            if (project.tasks && Array.isArray(project.tasks)) {
              project.tasks.forEach(task => {
                if (task.createdBy && (task.createdBy._id === managerId || task.createdBy === managerId)) {
                  if (!tasksByManager.has(managerId)) {
                    tasksByManager.set(managerId, []);
                  }
                  tasksByManager.get(managerId).push(task);
                }
              });
            }
          });
        }
      });

      // Fetch all unique manager details from the backend
      const { supervisorAPI } = await import('@/utils/api');
      const managersData = await supervisorAPI.getManagers();
      const allManagers = managersData || [];
      
      // Create manager map with actual user data and project statistics
      const managerMap = new Map();
      
      allManagers.forEach(manager => {
        const managerId = manager._id;
        if (managerIdsSet.has(managerId)) {
          const managerProjects = projectsByManager.get(managerId) || [];
          const managerTasks = tasksByManager.get(managerId) || [];
          
          let pendingProjects = 0;
          let inProgressProjects = 0;
          let completedProjects = 0;
          let totalBudgetAllocated = 0;
          let totalSalaryReceived = 0;
          
          let pendingTasks = 0;
          let inProgressTasks = 0;
          let completedTasks = 0;
          
          // Calculate project statistics
          managerProjects.forEach(project => {
            switch (project.status) {
              case 'pending':
                pendingProjects++;
                break;
              case 'in-progress':
                inProgressProjects++;
                break;
              case 'completed':
                completedProjects++;
                break;
            }
            
            totalBudgetAllocated += project.totalBudget || 0;
            totalSalaryReceived += project.managerSalary || 0;
          });
          
          // Calculate task statistics
          managerTasks.forEach(task => {
            switch (task.status) {
              case 'pending':
                pendingTasks++;
                break;
              case 'in-progress':
                inProgressTasks++;
                break;
              case 'completed':
                completedTasks++;
                break;
            }
          });
          
          managerMap.set(managerId, {
            _id: manager._id,
            name: manager.name,
            email: manager.email,
            profileImageUrl: manager.profileImageUrl,
            projects: managerProjects,
            tasks: managerTasks,
            totalProjects: managerProjects.length,
            pendingProjects,
            inProgressProjects,
            completedProjects,
            totalTasks: managerTasks.length,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            totalBudgetAllocated,
            totalSalaryReceived,
          });
        }
      });

      const relevantManagers = Array.from(managerMap.values()).filter(manager => manager.totalProjects > 0);
      setManagers(relevantManagers);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  const filterManagers = () => {
    let filtered = managers;

    if (searchTerm) {
      filtered = filtered.filter(manager =>
        (manager.name && manager.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (manager.email && manager.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredManagers(filtered);
  };

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      const blob = await reportAPI.downloadManagersReport();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `supervisor-managers-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Managers report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloadingReport(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTotalStats = () => {
    const totalManagers = filteredManagers.length;
    const totalProjects = filteredManagers.reduce((sum, manager) => sum + manager.totalProjects, 0);
    const totalTasks = filteredManagers.reduce((sum, manager) => sum + manager.totalTasks, 0);
    const totalPendingProjects = filteredManagers.reduce((sum, manager) => sum + manager.pendingProjects, 0);
    const totalInProgressProjects = filteredManagers.reduce((sum, manager) => sum + manager.inProgressProjects, 0);
    const totalCompletedProjects = filteredManagers.reduce((sum, manager) => sum + manager.completedProjects, 0);

    return { totalManagers, totalProjects, totalTasks, totalPendingProjects, totalInProgressProjects, totalCompletedProjects };
  };

  const stats = getTotalStats();

  return (
    <SupervisorLayout>
      {loading ? (
        <div className="px-4 lg:px-6 mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Managers...</h1>
              <p className="text-muted-foreground">Please wait while we fetch manager data</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Header Section with same spacing as Dashboard */}
          <div className="px-4 lg:px-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Managers</h1>
                <p className="text-muted-foreground">
                  Manage and view statistics for all managers working on your projects
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={fetchManagers}
                  variant="outline"
                  size="sm"
                >
                  <IconRefresh className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  disabled={downloadingReport}
                  className="bg-primary  hover:bg-emerald-700"
                >
                  <IconDownload className="h-4 w-4 mr-2" />
                  {downloadingReport ? 'Downloading...' : 'Download Report'}
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics Cards with same spacing as Dashboard */}
          <div className="px-4 lg:px-6 mb-6">
            <div className="flex gap-4 w-full">
              {/* Managers Card - 16.66% width */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28" style={{width: '16.66%'}}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Managers</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalManagers}</div>
                    <p className="text-xs text-gray-600 font-medium">Active Managers</p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Projects Card - 16.66% width */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28" style={{width: '16.66%'}}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Projects</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalProjects}</div>
                    <p className="text-xs text-gray-600 font-medium">All Projects</p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Tasks Card - 16.66% width */}
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 shadow-md h-28" style={{width: '16.66%'}}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Tasks</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalTasks}</div>
                    <p className="text-xs text-gray-600 font-medium">Tasks Created</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Projects Card - 16.66% width */}
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-md h-28" style={{width: '16.66%'}}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Pending</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalPendingProjects}</div>
                    <p className="text-xs text-gray-600 font-medium">Pending Projects</p>
                  </div>
                </CardContent>
              </Card>

              {/* In Progress Projects Card - 16.66% width */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28" style={{width: '16.66%'}}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">In Progress</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalInProgressProjects}</div>
                    <p className="text-xs text-gray-600 font-medium">Active Projects</p>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Projects Card - 16.66% width */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28" style={{width: '16.66%'}}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Completed</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalCompletedProjects}</div>
                    <p className="text-xs text-gray-600 font-medium">Done Projects</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search Section with same spacing as Dashboard */}
          <div className="px-4 lg:px-6 mb-6">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search managers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Managers Grid with same spacing as Dashboard */}
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Managers ({filteredManagers.length})</h3>
                </div>
                
                {/* Managers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredManagers.map((manager) => (
                    <Card key={manager._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {(manager.name || manager.email || 'M').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{manager.name || manager.email || 'Unknown Manager'}</CardTitle>
                            <p className="text-sm text-gray-600 truncate">{manager.email || 'No email'}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Project & Task Statistics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{manager.totalProjects}</p>
                            <p className="text-xs text-gray-600">Projects</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">{manager.totalTasks}</p>
                            <p className="text-xs text-gray-600">Tasks Created</p>
                          </div>
                        </div>

                        {/* Budget Information */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">
                              ${manager.totalBudgetAllocated?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-gray-600">Budget Allocated</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">
                              ${manager.totalSalaryReceived?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-gray-600">Total Salary</p>
                          </div>
                        </div>

                        {/* Project Status Breakdown */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className={getStatusColor('pending')}>
                              Pending
                            </Badge>
                            <span className="font-medium">{manager.pendingProjects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className={getStatusColor('in-progress')}>
                              In Progress
                            </Badge>
                            <span className="font-medium">{manager.inProgressProjects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className={getStatusColor('completed')}>
                              Completed
                            </Badge>
                            <span className="font-medium">{manager.completedProjects}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {manager.totalProjects > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Project Progress</span>
                              <span>{Math.round((manager.completedProjects / manager.totalProjects) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(manager.completedProjects / manager.totalProjects) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Projects List */}
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Recent Projects</p>
                          <div className="max-h-20 overflow-y-auto space-y-1">
                            {manager.projects.slice(0, 3).map((project, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <IconFolder className="h-3 w-3 text-blue-500" />
                                <span className="truncate flex-1">{project.title}</span>
                                <Badge variant="outline" className="text-xs py-0 px-1">
                                  {project.status}
                                </Badge>
                              </div>
                            ))}
                            {manager.projects.length > 3 && (
                              <p className="text-xs text-gray-500">+{manager.projects.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {filteredManagers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <IconUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No managers found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm
                        ? 'No managers match your search criteria.'
                        : 'No managers are currently assigned to your projects.'}
                    </p>
                    {searchTerm && (
                      <Button onClick={() => setSearchTerm('')} variant="outline">
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SupervisorLayout>
  );
};

export default ManageManagers;