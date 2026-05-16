import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SupervisorLayout } from "@/components/supervisor-layout"
import { SupervisorCharts } from "@/components/supervisor-charts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronRight } from "lucide-react"
import { projectAPI, supervisorAPI } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

const SupervisorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    fetchProjects();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const data = await supervisorAPI.getSupervisorDashboard();
      console.log('Fetched supervisor dashboard data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectAPI.getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleProjectClick = (projectId) => {
    navigate(`/supervisor/projects/update/${projectId}`);
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
  // Calculate dashboard metrics
  const getManagerCount = () => {
    if (!projects.length) return 0;
    const uniqueManagers = new Set();
    projects.forEach(project => {
      if (project.assignedTo && Array.isArray(project.assignedTo)) {
        project.assignedTo.forEach(manager => {
          if (manager._id || manager) {
            uniqueManagers.add(manager._id || manager);
          }
        });
      } else if (project.assignedTo) {
        uniqueManagers.add(project.assignedTo._id || project.assignedTo);
      }
    });
    return uniqueManagers.size;
  };

  const getProjectCompletion = () => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(project => project.status === 'completed').length;
    return { total: totalProjects, completed: completedProjects };
  };

  const getTotalBudget = () => {
    return projects.reduce((total, project) => total + (project.totalBudget || 0), 0);
  };

  const getTeamMembersCount = () => {
    // Get unique team members from all projects' tasks
    const uniqueMembers = new Set();
    projects.forEach(project => {
      if (project.tasks && Array.isArray(project.tasks)) {
        project.tasks.forEach(task => {
          if (task.assignedTo && Array.isArray(task.assignedTo)) {
            task.assignedTo.forEach(member => {
              if (member._id || member) {
                uniqueMembers.add(member._id || member);
              }
            });
          }
        });
      }
    });
    return uniqueMembers.size;
  };
  if (loading) {
    return (
      <SupervisorLayout>
        <div className="px-4 lg:px-6 mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Dashboard...</h1>
              <p className="text-muted-foreground">Please wait while we fetch your dashboard data</p>
            </div>
          </div>
        </div>
      </SupervisorLayout>
    );
  }
  const managerCount = getManagerCount();
  const projectCompletion = getProjectCompletion();
  const completionPercentage = projectCompletion.total > 0 ? Math.round((projectCompletion.completed / projectCompletion.total) * 100) : 0;
  const totalBudget = getTotalBudget();
  const teamMembersCount = getTeamMembersCount();

  return (
    <SupervisorLayout>      {/* Dashboard Cards */}
      <div className="px-4 lg:px-6 mb-6">        <div className="flex gap-4 w-full">
          {/* Welcome Card - 30% width */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28" style={{width: '30%'}}>
            <CardContent className="flex items-center justify-start p-4 h-full">
              <div className="text-left w-full">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Hi {user?.username || 'Supervisor'} 👋
                </h2>
                <p className="text-sm text-gray-700 font-medium">Welcome back to your dashboard!</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Budget Card - 17.5% width */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28" style={{width: '17.5%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Budget</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">${totalBudget.toLocaleString()}</div>
                <p className="text-xs text-gray-600 font-medium">Allocated Budget</p>
              </div>
            </CardContent>
          </Card>

          {/* Team Members Card - 17.5% width */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28" style={{width: '17.5%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Team Members</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{teamMembersCount}</div>
                <p className="text-xs text-gray-600 font-medium">Active Members</p>
              </div>
            </CardContent>
          </Card>

          {/* Managers Card - 17.5% width */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28" style={{width: '17.5%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Managers</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{managerCount}</div>
                <p className="text-xs text-gray-600 font-medium">Total Managers</p>
              </div>
            </CardContent>
          </Card>

          {/* Project Completion Card - 17.5% width */}
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 shadow-md h-28" style={{width: '17.5%'}}>
            <CardContent className="flex flex-col justify-center items-start p-3 h-full">
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Project Completion</p>
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {projectCompletion.completed}/{projectCompletion.total}
                </div>
                <div className="text-sm font-bold text-blue-500">
                  {completionPercentage}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart section */}
      <div className="px-4 lg:px-6 mb-6 relative z-10">
        <SupervisorCharts data={dashboardData} />
      </div>

      {/* Projects table */}
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Projects</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/supervisor/projects')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
              >
                See All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead className="text-right">Priority</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No projects found. Create your first project!
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project._id}>
                      <TableCell className="font-medium">
                        {project.title}
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
                      </TableCell>                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProjectClick(project._id)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  )
}

export default SupervisorDashboard