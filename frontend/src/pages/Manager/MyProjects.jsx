import React, { useState, useEffect } from 'react'
import { ManagerLayout } from "@/components/manager-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Filter, Users, Calendar, DollarSign, User, Mail, ChevronDown, ChevronUp } from "lucide-react"
import { projectAPI } from '@/utils/api'

const MyProjects = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [expandedUsers, setExpandedUsers] = useState({}) // Track which project's users are expanded

  useEffect(() => {
    fetchMyProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const fetchMyProjects = async () => {
    try {
      const data = await projectAPI.getProjects()
      console.log('Fetched manager projects:', data)
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
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.createdBy?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
  const toggleExpandedUsers = (projectId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
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

  const renderProjectCard = (project) => (
    <Card 
      key={project._id} 
      className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-500"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {project.title}
            </CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={getPriorityColor(project.priority)} className="text-xs">
              {project.priority}
            </Badge>
            <Badge variant={getStatusColor(project.status)} className="text-xs">
              {project.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Supervisor Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800 truncate">
                {project.createdBy?.name || 'Unknown Supervisor'}
              </p>
              <p className="text-xs text-blue-600 truncate">
                {project.createdBy?.email || 'No email'}
              </p>
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-gray-500" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</p>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {new Date(project.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-gray-500" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">My Salary</p>
            </div>
            <p className="text-lg font-semibold text-green-600">
              ${project.managerSalary?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Budget Info */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-gray-500" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Budget</p>
          </div>
          <p className="text-lg font-semibold text-blue-600">
            ${project.totalBudget?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Assigned Managers */}
        {project.assignedTo && project.assignedTo.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-gray-500" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Assigned Managers ({project.assignedTo.length})
                </p>
              </div>
              {project.assignedTo.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandedUsers(project._id);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  {expandedUsers[project._id] ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show All
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {(expandedUsers[project._id] ? project.assignedTo : project.assignedTo.slice(0, 3)).map((manager) => (
                <div key={manager._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{manager.name}</p>
                    <p className="text-xs text-gray-500 truncate">{manager.email}</p>
                  </div>
                </div>
              ))}
              {!expandedUsers[project._id] && project.assignedTo.length > 3 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  +{project.assignedTo.length - 3} more managers
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
  const getProjectStats = () => {
    const totalProjects = filteredProjects.length
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length
    const inProgressProjects = filteredProjects.filter(p => p.status === 'in-progress').length
    const pendingProjects = filteredProjects.filter(p => p.status === 'pending').length
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0)

    return {
      total: totalProjects,
      completed: completedProjects,
      inProgress: inProgressProjects,
      pending: pendingProjects,
      totalBudget
    }
  }

  const stats = getProjectStats()

  return (
    <ManagerLayout>
      {loading ? (
        <div className="px-4 lg:px-6 mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Projects...</h1>
              <p className="text-muted-foreground">Please wait while we fetch your projects</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 lg:px-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">My Projects</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28">
              <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                <div className="text-left w-full">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Projects</p>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
                  <p className="text-xs text-gray-600 font-medium">Assigned to you</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28">
              <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                <div className="text-left w-full">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Completed</p>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.completed}</div>
                  <p className="text-xs text-gray-600 font-medium">Successfully finished</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28">
              <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                <div className="text-left w-full">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">In Progress</p>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.inProgress}</div>
                  <p className="text-xs text-gray-600 font-medium">Currently working</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28">
              <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                <div className="text-left w-full">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Budget</p>
                  <div className="text-2xl font-bold text-blue-600 mb-1">${stats.totalBudget.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 font-medium">Allocated budget</p>
                </div>
              </CardContent>
            </Card>
          </div>          <div className="rounded-lg border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Project List</h3>
                {projects.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''} {filteredProjects.length !== projects.length ? 'filtered' : 'assigned'}
                  </p>
                )}
              </div>              {/* Filters Section */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects, supervisor name or email..."
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
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="rounded-r-none"
                    >
                      Cards
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="rounded-l-none"
                    >
                      Table
                    </Button>
                  </div>
                </div>
              </div>              {/* Cards View */}
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.length === 0 ? (
                    <div className="col-span-full">
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                          <p className="text-muted-foreground text-center">
                            {projects.length === 0 ? "No projects assigned to you yet!" : "No projects match your current filters."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    filteredProjects.map(renderProjectCard)
                  )}
                </div>
              ) : (
                /* Table View */
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead className="text-right">Supervisor</TableHead>
                      <TableHead className="text-right">Priority</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Due Date</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">My Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {projects.length === 0 ? "No projects assigned to you yet!" : "No projects match your current filters."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProjects.map((project) => (
                        <TableRow key={project._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <span className="cursor-pointer hover:text-blue-600 transition-colors">
                                  {project.title}
                                </span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold">{project.title}</h4>
                                  {project.description && (
                                    <p className="text-sm text-muted-foreground">{project.description}</p>
                                  )}
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-right">
                              <div className="font-medium text-sm">{project.createdBy?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{project.createdBy?.email || 'No email'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getPriorityColor(project.priority)}>
                              {project.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(project.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${project.totalBudget?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-green-600">
                              ${project.managerSalary?.toLocaleString() || '0'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  )
}

export default MyProjects