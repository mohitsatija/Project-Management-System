import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SupervisorLayout } from "@/components/supervisor-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Download,
  Search,
  Filter,
  PinIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Grid3X3,
  List
} from "lucide-react"
import { projectAPI, reportAPI } from '@/utils/api'

const ManageProjects = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const navigate = useNavigate()
  // const { user } = useAuth() // Commented out as it's not used currently

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const fetchProjects = async () => {
    try {
      const data = await projectAPI.getProjects()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = [...projects]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter)
    }

    setFilteredProjects(filtered)
  }
  const handleProjectClick = (projectId) => {
    navigate(`/supervisor/projects/update/${projectId}`)
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
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const calculateTaskStats = (project) => {
    const tasks = project.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    return { total: totalTasks, completed: completedTasks }
  }
  const downloadReport = async () => {
    try {
      const blob = await reportAPI.downloadProjectsReport()
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'projects_report.xlsx'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading report:', error)
      // You could show a toast notification here
    }
  }

  const getProjectStats = () => {
    const totalProjects = projects.length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const inProgressProjects = projects.filter(p => p.status === 'in-progress').length
    const pendingProjects = projects.filter(p => p.status === 'pending').length
    const totalBudget = projects.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
    const currentBudget = projects.reduce((sum, p) => sum + (p.currentBudget || 0), 0)

    return {
      total: totalProjects,
      completed: completedProjects,
      inProgress: inProgressProjects,
      pending: pendingProjects,
      totalBudget,
      currentBudget
    }
  }
  if (loading) {
    return (
      <SupervisorLayout>
        <div className="px-4 lg:px-6 mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Projects...</h1>
              <p className="text-muted-foreground">Please wait while we fetch your projects</p>
            </div>
          </div>
        </div>
      </SupervisorLayout>
    )
  }

  const stats = getProjectStats()

  return (
    <SupervisorLayout>
      <div className="px-4 lg:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Projects</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Oversee and manage all your projects in one place
            </p>
          </div>
          <Button onClick={downloadReport} className="flex items-center gap-2 bg-primary hover:bg-emerald-700">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28">
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Projects</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
                <p className="text-xs text-gray-600 font-medium">All Projects</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28">
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Completed</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.completed}</div>
                <p className="text-xs text-gray-600 font-medium">Done Projects</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 shadow-md h-28">
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">In Progress</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.inProgress}</div>
                <p className="text-xs text-gray-600 font-medium">Active Projects</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28">
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Pending</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.pending}</div>
                <p className="text-xs text-gray-600 font-medium">Pending Projects</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28">
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Budget</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">${stats.totalBudget.toLocaleString()}</div>
                <p className="text-xs text-gray-600 font-medium">Allocated Budget</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 shadow-md h-28">
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Current Budget</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">${stats.currentBudget.toLocaleString()}</div>
                <p className="text-xs text-gray-600 font-medium">Available Budget</p>
              </div>
            </CardContent>
          </Card>
        </div>        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
            <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="px-3 py-1"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="px-3 py-1"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </div>{/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No projects found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {projects.length === 0 ? "Create your first project to get started." : "Try adjusting your search or filters."}
              </p>
              {projects.length === 0 && (
                <Button 
                  onClick={() => navigate('/supervisor/create-project')} 
                  className="mt-4"
                >
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>        ) : viewMode === 'table' ? (
          // Table View
          <div className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead className="text-right">Project ID</TableHead>
                  <TableHead className="text-right">Total Budget</TableHead>
                  <TableHead className="text-right">Current Budget</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project._id} className="hover:bg-gray-50">                    <TableCell className="font-medium">
                      <span className="cursor-pointer hover:text-blue-600 transition-colors">
                        {project.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {project._id.slice(-8)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600">
                        ${project.totalBudget?.toLocaleString() || '0'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-blue-600">
                        ${project.currentBudget?.toLocaleString() || '0'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleProjectClick(project._id)}
                        className="bg-primary hover:bg-primary/90 text-white"
                        size="sm"
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (// Card View (existing)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const taskStats = calculateTaskStats(project)
              return (
                <Card key={project._id} className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-blue-500 cursor-pointer hover:border-l-blue-600">                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                          {project.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {project.attachments && project.attachments.length > 0 && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <PinIcon className="h-4 w-4 text-gray-500" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Attachments</h4>
                                <div className="space-y-1">
                                  {project.attachments.map((attachment, attachmentIndex) => (
                                    <div key={`attachment-${project._id}-${attachmentIndex}`} className="text-xs p-2 bg-gray-50 rounded">
                                      {attachment}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                        {project.priority}
                      </Badge>
                      <Badge variant={getStatusColor(project.status)} className="text-xs flex items-center gap-1">
                        {getStatusIcon(project.status)}
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">{/* Project Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Fund/Budget</p>
                          <p className="text-lg font-bold text-green-600">${project.totalBudget?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Tasks Created</p>
                          <p className="text-lg font-semibold text-gray-900">{taskStats.total}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Start Date</p>
                          <p className="text-sm font-medium text-gray-700">
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 text-right">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Current Budget</p>
                          <p className="text-lg font-bold text-blue-600">${project.currentBudget?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Tasks Completed</p>
                          <p className="text-lg font-semibold text-green-600">{taskStats.completed}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Due Date</p>
                          <p className="text-sm font-medium text-gray-700">
                            {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>                    {/* Assigned Managers */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Assigned Managers</p>
                      <div className="flex flex-wrap gap-1">
                        {project.assignedTo && project.assignedTo.length > 0 ? (
                          project.assignedTo.map((manager) => (
                            <Badge key={`manager-${project._id}-${manager._id || manager.email}`} variant="outline" className="text-xs">
                              {manager.name || manager.email}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No managers assigned</span>
                        )}
                      </div>
                    </div>                    {/* Action Button */}
                    <Button
                      onClick={() => handleProjectClick(project._id)}
                      className="w-full mt-4 bg-primary hover:bg-primary/90 text-white group-hover:bg-blue-600 transition-colors duration-200"
                    >
                      Update
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </SupervisorLayout>
  )
}

export default ManageProjects