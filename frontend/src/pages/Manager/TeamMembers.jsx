import React, { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/manager-layout';
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
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { userAPI, reportAPI, taskAPI } from '@/utils/api';

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingReport, setDownloadingReport] = useState(false);
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, searchTerm]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Get all tasks created by this manager
      const tasksData = await taskAPI.getTasks();
      const managerTasks = tasksData.tasks || [];
      
      // Get all users assigned to these tasks
      const assignedUserIds = new Set();
      managerTasks.forEach(task => {
        if (task.assignedTo && Array.isArray(task.assignedTo)) {
          task.assignedTo.forEach(user => {
            assignedUserIds.add(user._id || user);
          });
        }
      });

      // Get all users with their task statistics
      const usersData = await userAPI.getUsers();
      
      // Filter to only include users working on manager's tasks and calculate their stats for manager's tasks only
      const relevantMembers = usersData
        .filter(user => assignedUserIds.has(user._id))
        .map(user => {
          // Calculate task statistics specific to this manager's tasks
          const userTasks = managerTasks.filter(task => 
            task.assignedTo?.some(assignedUser => 
              (assignedUser._id || assignedUser) === user._id
            )
          );

          const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
          const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
          const completedTasks = userTasks.filter(task => task.status === 'completed').length;
          const totalTasks = userTasks.length;
          const totalSalary = userTasks.reduce((sum, task) => sum + (task.salary || 50), 0);

          return {
            ...user,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            totalTasks,
            totalSalary,
          };
        });

      setTeamMembers(relevantMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  };

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      const blob = await reportAPI.downloadUsersReport();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `team-members-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Team members report downloaded successfully');
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
    const totalMembers = filteredMembers.length;
    const totalTasks = filteredMembers.reduce((sum, member) => sum + member.totalTasks, 0);
    const totalPending = filteredMembers.reduce((sum, member) => sum + member.pendingTasks, 0);
    const totalInProgress = filteredMembers.reduce((sum, member) => sum + member.inProgressTasks, 0);
    const totalCompleted = filteredMembers.reduce((sum, member) => sum + member.completedTasks, 0);

    return { totalMembers, totalTasks, totalPending, totalInProgress, totalCompleted };
  };

  const stats = getTotalStats();  return (
    <ManagerLayout>
      {loading ? (
        <div className="px-4 lg:px-6 mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Team Members...</h1>
              <p className="text-muted-foreground">Please wait while we fetch team member data</p>
            </div>
          </div>
        </div>      ) : (
        <div>
      {/* Header Section with same spacing as Dashboard */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">
              Manage and view statistics for all team members working on your tasks
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchTeamMembers}
              variant="outline"
              size="sm"
            >
              <IconRefresh className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleDownloadReport}
              disabled={downloadingReport}
              className="bg-primary hover:bg-primary/90"
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
          {/* Team Members Card - 20% width */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28" style={{width: '20%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Team Members</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalMembers}</div>
                <p className="text-xs text-gray-600 font-medium">Active Members</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Tasks Card - 20% width */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28" style={{width: '20%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Tasks</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalTasks}</div>
                <p className="text-xs text-gray-600 font-medium">All Tasks</p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks Card - 20% width */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-md h-28" style={{width: '20%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Pending</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalPending}</div>
                <p className="text-xs text-gray-600 font-medium">Pending Tasks</p>
              </div>
            </CardContent>
          </Card>

          {/* In Progress Tasks Card - 20% width */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28" style={{width: '20%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">In Progress</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalInProgress}</div>
                <p className="text-xs text-gray-600 font-medium">Active Tasks</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks Card - 20% width */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28" style={{width: '20%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Completed</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalCompleted}</div>
                <p className="text-xs text-gray-600 font-medium">Done Tasks</p>
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
            placeholder="Search team members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Team Members Grid with same spacing as Dashboard */}
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Team Members ({filteredMembers.length})</h3>
            </div>
            
            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                        <p className="text-sm text-gray-600 truncate">{member.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Task Statistics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{member.totalTasks}</p>
                        <p className="text-xs text-gray-600">Total Tasks</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">
                          ${member.totalSalary?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-600">Total Salary</p>
                      </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className={getStatusColor('pending')}>
                          Pending
                        </Badge>
                        <span className="font-medium">{member.pendingTasks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className={getStatusColor('in-progress')}>
                          In Progress
                        </Badge>
                        <span className="font-medium">{member.inProgressTasks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className={getStatusColor('completed')}>
                          Completed
                        </Badge>
                        <span className="font-medium">{member.completedTasks}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {member.totalTasks > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span>{Math.round((member.completedTasks / member.totalTasks) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(member.completedTasks / member.totalTasks) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>            {/* Empty State */}
            {filteredMembers.length === 0 && !loading && (
              <div className="text-center py-12">
                <IconUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'No team members match your search criteria.'
                    : 'No team members are currently assigned to your tasks.'}
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                )}
              </div>            )}          </div>
        </div>
      </div>
      </div>
      )}
    </ManagerLayout>
  );
};

export default TeamMembers;