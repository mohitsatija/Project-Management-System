import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MemberLayout } from "@/components/member-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  IconSearch,
  IconClock,
  IconFolder,
  IconPaperclip,
  IconRefresh,
  IconChecks,
  IconFilter,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { taskAPI } from '@/utils/api'

const MemberTasks = () => {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [])
  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter])
  
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await taskAPI.getTasks()
      console.log('API Response:', data)
      console.log('Tasks array:', data.tasks)
      if (data.tasks && data.tasks.length > 0) {
        console.log('Sample task:', data.tasks[0])
      }
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    if (projectFilter !== 'all') {
      if (projectFilter === 'individual') {
        filtered = filtered.filter(task => !task.projectId)
      } else {
        filtered = filtered.filter(task => task.projectId?._id === projectFilter)
      }
    }

    setFilteredTasks(filtered)
  }
  const handleTaskClick = (taskId) => {
    console.log('Navigating to task details with ID:', taskId);
    if (!taskId) {
      toast.error('Task ID is missing');
      return;
    }
    navigate(`/member/task-details/${taskId}`)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in-progress': return 'default'
      case 'pending': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <IconChecks className="h-3 w-3" />
      case 'in-progress': return <IconClock className="h-3 w-3" />
      case 'pending': return <IconClock className="h-3 w-3" />
      default: return <IconClock className="h-3 w-3" />
    }
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status).length
  }

  const getUniqueProjects = () => {
    const projects = new Map()
    tasks.forEach(task => {
      if (task.projectId) {
        projects.set(task.projectId._id, task.projectId)
      }
    })
    return Array.from(projects.values())
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-GB')
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <MemberLayout>
      {/* Header Section */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-muted-foreground">
              View and manage your assigned tasks
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchTasks} variant="outline" size="sm" disabled={loading}>
              <IconRefresh className="h-4 w-4 mr-2" />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex gap-4 w-full">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28" style={{ width: '25%' }}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Tasks</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{tasks.length}</div>
                <p className="text-xs text-gray-600 font-medium">All assigned tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28" style={{ width: '25%' }}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Pending</p>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {getTasksByStatus('pending')}
                </div>
                <p className="text-xs text-gray-600 font-medium">Awaiting progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28" style={{ width: '25%' }}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">In Progress</p>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {getTasksByStatus('in-progress')}
                </div>
                <p className="text-xs text-gray-600 font-medium">Currently active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28" style={{ width: '25%' }}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Completed</p>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {getTasksByStatus('completed')}
                </div>
                <p className="text-xs text-gray-600 font-medium">Successfully finished</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Section */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <div className="px-4 lg:px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <Card key={`task-skeleton-${index}`} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center mb-4">
                {tasks.length === 0
                  ? "You don't have any tasks assigned yet."
                  : "No tasks match your current filters. Try adjusting your search criteria."
                }
              </p>
            </CardContent>
          </Card>        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => {
              const taskStats = {
                completed: task.todoChecklist?.filter(item => item.completed).length || 0,
                total: task.todoChecklist?.length || 0,
              };              return (
                <Card
                  key={task._id}
                  className="hover:shadow-lg hover:scale-105 transition-all duration-300 group break-words overflow-hidden cursor-pointer"
                >                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <HoverCard>
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
                      
                      {/* Attachment Pin in Top Right Corner */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="ml-2">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="relative cursor-pointer">
                                <IconPaperclip className="h-5 w-5 text-blue-600 hover:text-blue-700 transition-colors" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                  {task.attachments.length}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <IconPaperclip className="h-4 w-4" />
                                  Attachments ({task.attachments.length})
                                </h4>
                                <div className="space-y-1">
                                  {task.attachments.map((attachment, index) => (
                                    <div key={`attachment-${task._id}-${index}`} className="text-xs p-2 bg-gray-50 rounded border">
                                      📎 {attachment}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      )}
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
                  </CardHeader>                  <CardContent className="pt-0 space-y-4">                    {/* Project Label */}
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
                                  {task.projectId.createdBy && (
                                    <div className="mt-2 pt-2 border-t">
                                      <p className="text-xs font-medium">Supervisor:</p>
                                      <p className="text-xs text-purple-600">{task.projectId.createdBy.name}</p>
                                      {task.projectId.createdBy.email && (
                                        <p className="text-xs text-muted-foreground">{task.projectId.createdBy.email}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </div>
                    )}                    {/* Management Team */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Manager
                        </p>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="bg-blue-50 p-2 rounded-lg cursor-help">
                              <p className="text-sm font-medium text-blue-800 truncate">
                                {task.createdBy?.name || 'N/A'}
                              </p>
                              {task.createdBy?.email && (
                                <p className="text-xs text-blue-600 truncate">
                                  {task.createdBy.email}
                                </p>
                              )}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72" side="bottom">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Task Manager</h4>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">{task.createdBy?.name || 'N/A'}</p>
                                {task.createdBy?.email && (
                                  <p className="text-xs text-muted-foreground">{task.createdBy.email}</p>
                                )}
                                <p className="text-xs text-blue-600 font-medium">Role: Manager</p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Supervisor
                        </p>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="bg-purple-50 p-2 rounded-lg cursor-help">
                              <p className="text-sm font-medium text-purple-800 truncate">
                                {task.projectId?.createdBy?.name || 'N/A'}
                              </p>
                              {task.projectId?.createdBy?.email && (
                                <p className="text-xs text-purple-600 truncate">
                                  {task.projectId.createdBy.email}
                                </p>
                              )}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72" side="bottom">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Project Supervisor</h4>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">{task.projectId?.createdBy?.name || 'N/A'}</p>
                                {task.projectId?.createdBy?.email && (
                                  <p className="text-xs text-muted-foreground">{task.projectId.createdBy.email}</p>
                                )}
                                <p className="text-xs text-purple-600 font-medium">Role: Supervisor</p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>{/* Financial Information */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          My Salary
                        </p>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-lg font-bold text-green-700">
                            ${(task.memberSalary || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 font-medium">Your earnings</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Task Budget
                        </p>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-lg font-bold text-blue-700">
                            ${(task.taskBudget || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">Total allocated</p>
                        </div>
                      </div>
                    </div>                    {/* Attachments and Due Date */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Attachments
                        </p>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <IconPaperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {task.attachments?.length || 0} file{(task.attachments?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          Due Date
                        </p>
                        <div className={`p-2 rounded-lg ${isOverdue(task.dueDate) ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                          <p className={`text-sm font-medium ${isOverdue(task.dueDate) ? 'text-red-700' : 'text-gray-700'}`}>
                            {formatDate(task.dueDate)}
                            {isOverdue(task.dueDate) && (
                              <span className="text-xs ml-1 font-bold">(Overdue)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>                    {/* Progress */}
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
                    </div>                    {/* Team Members */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Team Members ({task.assignedTo?.length || 0})
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex flex-wrap gap-1">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            <>
                              {task.assignedTo.slice(0, 3).map((user) => (
                                <HoverCard key={user._id}>
                                  <HoverCardTrigger asChild>
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-help">
                                      {user.name.length > 12 ? `${user.name.substring(0, 12)}...` : user.name}
                                    </Badge>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-64" side="top">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">Team Member</h4>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        {user.email && (
                                          <p className="text-xs text-muted-foreground">{user.email}</p>
                                        )}
                                        <p className="text-xs text-blue-600 font-medium">Role: Member</p>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              ))}
                              {task.assignedTo.length > 3 && (
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 cursor-help">
                                      +{task.assignedTo.length - 3} more
                                    </Badge>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80" side="top">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">All Team Members ({task.assignedTo.length})</h4>
                                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                                        {task.assignedTo.map((user) => (
                                          <div key={user._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                                            <div>
                                              <p className="font-medium">{user.name}</p>
                                              {user.email && (
                                                <p className="text-muted-foreground">{user.email}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">No team members</span>
                          )}
                        </div>
                      </div>
                    </div>{/* Update Task Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task._id);
                        }}
                        className="w-full bg-gradient-to-r bg-primary hover-emerald-600 from-primary to-emerald-500 text-white"
                        size="sm"
                      >
                        View Task Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  )
}

export default MemberTasks