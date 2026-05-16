import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberLayout } from "@/components/member-layout";
import { MemberCharts } from "@/components/member-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import { taskAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

const MemberDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getUserDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/member/task-details/${taskId}`);
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

  const statistics = dashboardData?.statistics || {};
  const recentTasks = dashboardData?.recentTasks || [];

  return (
    <MemberLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 lg:px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Loading Dashboard...</h1>
            <p className="text-muted-foreground">Please wait while we fetch your dashboard data</p>
          </div>
        </div>
      ) : (
        <>
          <div className="px-4 lg:px-6 mb-6">
            <div className="flex gap-4 w-full">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md h-28" style={{ width: '30%' }}>
                <CardContent className="flex items-center justify-start p-4 h-full">
                  <div className="text-left w-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Hi {user?.username || 'Member'} 👋
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">Welcome back to your dashboard!</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Tasks</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{statistics.totalTasks || 0}</div>
                    <p className="text-xs text-gray-600 font-medium">Assigned to Me</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Completed Tasks</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{statistics.completedTasks || 0}</div>
                    <p className="text-xs text-gray-600 font-medium">Successfully Done</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Total Salary</p>
                    <div className="text-2xl font-bold text-blue-600 mb-1">${(statistics.totalSalaryReceived || 0).toLocaleString()}</div>
                    <p className="text-xs text-gray-600 font-medium">Earned</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 shadow-md h-28" style={{ width: '17.5%' }}>
                <CardContent className="flex flex-col justify-center items-start p-3 h-full">
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Pending Tasks</p>
                    <div className="text-xl font-bold text-blue-600 mb-1">{statistics.pendingTasks || 0}</div>
                    <p className="text-xs text-gray-600 font-medium">To Complete</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="px-4 lg:px-6 mb-6 relative z-10">
            <MemberCharts data={dashboardData} />
          </div>

          <div className="px-4 lg:px-6">
            <div className="rounded-lg border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Tasks</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/member/tasks')}
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
                      <TableHead className="text-right">Salary</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No tasks assigned to you yet!
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTasks.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell className="font-medium">
                            {task.title}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${(task.memberSalary || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTaskClick(task._id)}
                            >
                              View Details
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
    </MemberLayout>
  );
};

export default MemberDashboard;