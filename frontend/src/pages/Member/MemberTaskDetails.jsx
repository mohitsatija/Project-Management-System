import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MemberLayout } from "@/components/member-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  IconArrowLeft,
  IconCalendar,
  IconFolder,
  IconUser,
  IconPaperclip,
  IconClock,
  IconChecks,
  IconRefresh,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { taskAPI } from '@/utils/api'

const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (dateObj instanceof Date && !isNaN(dateObj)) {
    return dateObj.toLocaleDateString('en-GB');
  }
  return 'N/A';
};

const MemberTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getTaskById(id);
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to fetch task details');
      navigate('/member/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistUpdate = async (index, completed) => {
    if (!task) return;

    try {
      setUpdating(true);
      
      // Update the local state immediately for better UX
      const updatedChecklist = [...task.todoChecklist];
      updatedChecklist[index] = { ...updatedChecklist[index], completed };
      
      setTask(prev => ({
        ...prev,
        todoChecklist: updatedChecklist
      }));

      // Send update to backend
      await taskAPI.updateTaskChecklist(id, updatedChecklist);
      
      // Fetch updated task to get the new status
      await fetchTask();
      
      toast.success('Task checklist updated successfully');
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Failed to update checklist');
      // Revert the optimistic update on error
      await fetchTask();
    } finally {
      setUpdating(false);
    }
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
      case 'completed': return <IconChecks className="h-3 w-3" />;
      case 'in-progress': return <IconClock className="h-3 w-3" />;
      case 'pending': return <IconClock className="h-3 w-3" />;
      default: return <IconClock className="h-3 w-3" />;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Task Details...</h1>
              <p className="text-muted-foreground">Please wait while we fetch the task information</p>
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (!task) {
    return (
      <MemberLayout>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
            <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate('/member/tasks')}>
              Back to Tasks
            </Button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  const taskStats = {
    completed: task.todoChecklist?.filter(item => item.completed).length || 0,
    total: task.todoChecklist?.length || 0,
  };

  return (
    <MemberLayout>
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/member/tasks')} className="h-9 w-9 p-0">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
              <p className="text-muted-foreground">Manage your task progress and checklist</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={fetchTask} variant="outline" size="sm" disabled={loading || updating}>
              <IconRefresh className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Details */}
          <div className="lg:col-span-2 space-y-6">{/* Task Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{task.description || 'No description provided'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Priority</h3>
                    <Badge variant={getPriorityColor(task.priority)} className="text-sm">
                      {task.priority}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Status</h3>
                    <Badge variant={getStatusColor(task.status)} className="text-sm flex items-center gap-1 w-fit">
                      {getStatusIcon(task.status)}
                      {task.status}
                    </Badge>
                  </div>                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Task Budget</h3>
                    <div className="text-lg font-semibold text-green-600">
                      ${(task.taskBudget || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Due Date</h3>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}`}>
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && <span className="ml-1">(Overdue)</span>}
                      </span>
                    </div>
                  </div>                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Created</h3>
                    <span className="text-sm">{formatDate(task.createdAt)}</span>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Last Updated</h3>
                    <span className="text-sm">{formatDate(task.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <IconChecks className="h-5 w-5" />
                  Task Checklist
                  {updating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.todoChecklist && task.todoChecklist.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {task.todoChecklist.map((todo, index) => (
                        <div 
                          key={todo._id || index} 
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={(checked) => handleChecklistUpdate(index, checked)}
                            disabled={updating}
                          />
                          <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress:</span>
                        <span className="font-medium">
                          {taskStats.completed} / {taskStats.total} completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>                      <div className="text-xs text-muted-foreground mt-1">
                        {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% complete
                      </div>
                    </div>

                    {/* Task Completion Button */}
                    <div className="flex justify-center pt-4 border-t">
                      {taskStats.completed === taskStats.total && taskStats.total > 0 ? (
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                          disabled
                        >
                          <IconChecks className="h-4 w-4 mr-2" />
                          Task Completed ✓
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="px-6 py-2"
                          disabled
                        >
                          <IconClock className="h-4 w-4 mr-2" />
                          Complete All Items to Finish Task
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No checklist items for this task</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <IconPaperclip className="h-5 w-5" />
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent>                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <div key={`attachment-${attachment}-${index}`} className="p-3 bg-gray-50 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <IconPaperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>          {/* Right Column - Additional Information */}
          <div className="space-y-6">
            {/* Manager & Supervisor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconUser className="h-5 w-5" />
                  Task Management Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Project Manager</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconUser className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{task.createdBy?.name || 'Unknown Manager'}</p>
                      <p className="text-xs text-muted-foreground">{task.createdBy?.email || 'No email provided'}</p>
                      <p className="text-xs text-blue-600 font-medium">
                        Role: {task.createdBy?.role || 'Manager'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Supervisor (if task belongs to a project) */}
                {task.projectId?.supervisor && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Project Supervisor</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <IconUser className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{task.projectId.supervisor.name}</p>
                        <p className="text-xs text-muted-foreground">{task.projectId.supervisor.email}</p>
                        <p className="text-xs text-green-600 font-medium">Role: Supervisor</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Details */}
                {task.projectId && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Project Information</h3>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <IconFolder className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {task.projectId.title}
                        </span>
                      </div>
                      {task.projectId.description && (
                        <p className="text-xs text-blue-700">
                          {task.projectId.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            {task.assignedTo && task.assignedTo.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconUser className="h-5 w-5" />
                    Team Members ({task.assignedTo.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {task.assignedTo.slice(0, 8).map((user) => (
                      <div key={user._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <IconUser className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role || 'Member'}
                        </Badge>
                      </div>
                    ))}
                    {task.assignedTo.length > 8 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{task.assignedTo.length - 8} more team members
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}            {/* Task Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconClock className="h-5 w-5" />
                  Task Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{formatDate(task.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">{formatDate(task.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className={`font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                    {isOverdue(task.dueDate) && (
                      <div className="bg-red-50 p-2 rounded text-center">
                        <span className="text-red-600 font-medium text-xs">⚠️ This task is overdue!</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MemberLayout>
  )
}

export default MemberTaskDetails