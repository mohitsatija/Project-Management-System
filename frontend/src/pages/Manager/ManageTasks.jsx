import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManagerLayout } from '@/components/manager-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  IconSearch,
  IconPlus,
  IconClock,
  IconFolder,
  IconPaperclip,
  IconFilter,
  IconRefresh,
  IconEdit,
  IconDownload,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { taskAPI, reportAPI } from '@/utils/api';

const ManageTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter]);
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };
  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      if (projectFilter === 'individual') {
        filtered = filtered.filter(task => !task.projectId);
      } else {
        filtered = filtered.filter(task => task.projectId?._id === projectFilter);
      }
    }

    // Sort by creation date (newest first) when no filters are applied
    const isNoFiltersApplied = 
      !searchTerm && 
      statusFilter === 'all' && 
      priorityFilter === 'all' && 
      projectFilter === 'all';

    if (isNoFiltersApplied) {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredTasks(filtered);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/manager/tasks/update/${taskId}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'default';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <IconClock className="h-3 w-3" />;
      case 'in-progress': return <IconClock className="h-3 w-3" />;
      case 'pending': return <IconClock className="h-3 w-3" />;
      default: return <IconClock className="h-3 w-3" />;
    }
  };

  const getUniqueProjects = () => {
    const projects = new Map();
    tasks.forEach(task => {
      if (task.projectId) {
        projects.set(task.projectId._id, task.projectId);
      }
    });
    return Array.from(projects.values());
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB');
  };
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      const blob = await reportAPI.downloadTasksReport();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Tasks report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloadingReport(false);
    }
  };
  return (
    <ManagerLayout>
      {/* Header Section */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Tasks</h1>
            <p className="text-muted-foreground">
              Manage and monitor all your tasks
            </p>
          </div>          <div className="flex gap-3">
            <Button onClick={fetchTasks} variant="outline" size="sm" disabled={loading}>
              <IconRefresh className="h-4 w-4 mr-2" />
              {loading ? 'Refreshing...' : 'Refresh'}
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

      {loading ? (
        <div className="px-4 lg:px-6 mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Tasks...</h1>
              <p className="text-muted-foreground">Please wait while we fetch your tasks</p>
            </div>
          </div>
        </div>      ) : (
        <>      {/* Stats Cards */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex gap-4 w-full">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28" style={{width: '25%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Tasks</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{tasks.length}</div>
                <p className="text-xs text-gray-600 font-medium">All assigned tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28" style={{width: '25%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Pending</p>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {tasks.filter(t => t.status === 'pending').length}
                </div>
                <p className="text-xs text-gray-600 font-medium">Awaiting progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28" style={{width: '25%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">In Progress</p>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </div>
                <p className="text-xs text-gray-600 font-medium">Currently active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28" style={{width: '25%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Completed</p>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <p className="text-xs text-gray-600 font-medium">Successfully finished</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>      {/* Filters Section */}
      <div className="px-4 lg:px-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconFilter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="w-full">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="individual">Individual Tasks</SelectItem>
                    {getUniqueProjects().map(project => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setProjectFilter('all');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Grid */}
      <div className="px-4 lg:px-6">        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <IconFolder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {tasks.length === 0 
                  ? "You haven't created any tasks yet. Create your first task to get started."
                  : "No tasks match your current filters. Try adjusting your search criteria."
                }
              </p>
              {tasks.length === 0 && (
                <Button onClick={() => navigate('/manager/tasks/create')} className="bg-primary hover:bg-primary/90">
                  <IconPlus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </CardContent>
          </Card>        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => {
              const taskStats = {
                completed: task.todoChecklist?.filter(item => item.completed).length || 0,
                total: task.todoChecklist?.length || 0,
              };              return (                <Card 
                  key={task._id} 
                  className="hover:shadow-lg hover:scale-105 transition-all duration-300 group break-words overflow-hidden cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <h3 className="font-semibold text-lg break-words leading-tight group-hover:text-blue-600 transition-colors">
                              {task.title}
                            </h3>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80" side="top">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Task Details</h4>
                              <div className="space-y-1">
                                <p className="text-sm font-medium break-words">{task.title}</p>
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                  {task.description || 'No description provided'}
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 cursor-help">
                              {task.description || 'No description provided'}
                            </p>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80" side="bottom">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Full Description</h4>
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                {task.description || 'No description provided'}
                              </p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {task.attachments && task.attachments.length > 0 && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <IconPaperclip className="h-4 w-4 text-gray-500" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Attachments</h4>
                                <div className="space-y-1">
                                  {task.attachments.map((attachment, index) => (
                                    <div key={`attachment-${task._id}-${index}`} className="text-xs p-2 bg-gray-50 rounded">
                                      {attachment}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(task._id);
                          }}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <Badge variant={getStatusColor(task.status)} className="text-xs flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {task.status}
                      </Badge>
                      {task.projectId ? (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <IconFolder className="h-3 w-3" />
                          Project
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Individual
                        </Badge>
                      )}
                    </div>
                  </CardHeader>                  
                  <CardContent className="pt-0 space-y-4">                    {/* Project Label */}
                    {task.projectId && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <div className="flex items-center gap-2">
                          <IconFolder className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="text-sm font-medium text-blue-800 truncate cursor-help">
                                Project: {task.projectId.title}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80" side="bottom">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Project Information</h4>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{task.projectId.title}</p>
                                  {task.projectId.description && (
                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                      {task.projectId.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Task Budget
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          ${(task.taskBudget || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Supervisor
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {task.projectId?.createdBy?.name || 'N/A'}
                        </p>
                        {task.projectId?.createdBy?.email && (
                          <p className="text-xs text-gray-500">
                            {task.projectId.createdBy.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress - Full Width */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Progress
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {taskStats.completed}/{taskStats.total} items
                      </p>
                      {taskStats.total > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(taskStats.completed / taskStats.total) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Dates - Same Row */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Due Date
                        </p>
                        <p className={`text-sm font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(task.dueDate)}
                          {isOverdue(task.dueDate) && (
                            <span className="text-xs ml-1">(Overdue)</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Created
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(task.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Assigned Users */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Assigned Users ({task.assignedTo?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {task.assignedTo && task.assignedTo.length > 0 ? (
                          task.assignedTo.slice(0, 3).map((user) => (
                            <Badge key={user._id} variant="secondary" className="text-xs">
                              {user.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No users assigned</span>
                        )}
                        {task.assignedTo && task.assignedTo.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.assignedTo.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Update Task Button */}
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task._id);
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        size="sm"
                      >
                        <IconEdit className="h-4 w-4 mr-2" />
                        Update Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );            })}          </div>
        )}

        {/* Floating Action Button for Create Task */}
        {filteredTasks.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              onClick={() => navigate('/manager/tasks/create')} 
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
              size="sm"
            >
              <IconPlus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
        </>
      )}
    </ManagerLayout>
  );
};

export default ManageTasks;