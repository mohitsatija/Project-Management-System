import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManagerLayout } from '@/components/manager-layout';
import { ManagerCharts } from '@/components/manager-charts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight } from 'lucide-react';
import { taskAPI, projectAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await taskAPI.getDashboardData();
      console.log('Fetched dashboard data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
  const handleTaskClick = (taskId) => {
    navigate(`/manager/tasks/update/${taskId}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTaskCompletion = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    return { total: totalTasks, completed: completedTasks };
  };

  const getProjectStats = () => {
    const assignedProjects = projects.length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    return { assigned: assignedProjects, completed: completedProjects };
  };

  const taskCompletion = getTaskCompletion();
  const completionPercentage = taskCompletion.total > 0 ? Math.round((taskCompletion.completed / taskCompletion.total) * 100) : 0;
  const projectStats = getProjectStats();

  return (
    <ManagerLayout>
      {loading ? (
        <div className="px-4 lg:px-6 mb-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Loading Dashboard...</h1>
              <p className="text-muted-foreground">Please wait while we fetch your dashboard data</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="px-4 lg:px-6 mb-6">
            <div className="flex gap-4 w-full">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28" style={{ width: '30%' }}>
                <CardContent className="flex items-center justify-start p-4 h-full">
                  <div className="text-left w-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Hi {user?.username || 'Manager'} 👋</h2>
                    <p className="text-sm text-gray-700 font-medium">Welcome back to your dashboard!</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Salary</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      ${dashboardData?.statistics?.totalSalary?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">From All Projects</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Task Completion</p>
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {taskCompletion.completed}/{taskCompletion.total}
                    </div>
                    <div className="text-sm font-bold text-blue-500">{completionPercentage}%</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Project Assigned</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{projectStats.assigned}</div>
                    <p className="text-xs text-gray-600 font-medium">Total Projects</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Project Completed</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{projectStats.completed}</div>
                    <p className="text-xs text-gray-600 font-medium">Successfully Done</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="px-4 lg:px-6 mb-6 relative z-10">
            <ManagerCharts data={dashboardData} />
          </div>

          <div className="px-4 lg:px-6">
            <div className="rounded-lg border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Tasks</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/manager/tasks')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
                  >
                    See All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead>
                      <TableHead className="text-right">Priority</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Due Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No tasks created yet!
                        </TableCell>
                      </TableRow>                    ) : (
                      tasks
                        .toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                        .map((task) => (
                        <TableRow key={task._id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </TableCell>                          <TableCell className="text-right">
                            <Button className="bg-primary hover:bg-primary/90 text-white" size="sm" onClick={() => handleTaskClick(task._id)}>
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
        </>
      )}
    </ManagerLayout>
  );
};

export default Dashboard;