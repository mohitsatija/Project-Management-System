import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Project Status Donut Chart Component
function ProjectStatusDonutChart({ data }) {
  const allProjects = data?.allProjects || [];
  const projectStatusData = [
    { browser: "pending", visitors: allProjects.filter(p => p.status === 'pending').length, fill: "#ff7f00" },
    { browser: "inprogress", visitors: allProjects.filter(p => p.status === 'in-progress').length, fill: "#2563eb" },
    { browser: "completed", visitors: allProjects.filter(p => p.status === 'completed').length, fill: "#16a34a" },
  ].filter(item => item.visitors > 0);

  const totalProjects = allProjects.length;

  const chartConfig = {
    visitors: {
      label: "Projects",
    },
    pending: {
      label: "Pending",
      color: "#ff7f00",
    },
    inprogress: {
      label: "In Progress", 
      color: "#2563eb",
    },
    completed: {
      label: "Completed",
      color: "#16a34a",
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Total Projects: {totalProjects}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={projectStatusData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={40}
              outerRadius={80}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Task Status Pie Chart Component  
function TaskStatusPieChart({ data }) {
  const allTasks = data?.allTasks || [];
  const taskStatusData = [
    { status: "pending", value: allTasks.filter(task => task.status === 'pending').length, fill: "#ff7f00" },
    { status: "inprogress", value: allTasks.filter(task => task.status === 'in-progress').length, fill: "#2563eb" },
    { status: "completed", value: allTasks.filter(task => task.status === 'completed').length, fill: "#16a34a" },
  ].filter(item => item.value > 0);

  const chartConfig = {
    pending: {
      label: "Pending",
      color: "#ff7f00",
    },
    inprogress: {
      label: "In Progress", 
      color: "#2563eb",
    },
    completed: {
      label: "Completed",
      color: "#16a34a",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status</CardTitle>
        <CardDescription>
          Task distribution by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={taskStatusData}
              dataKey="value"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Priority Pie Chart Component
function PriorityPieChart({ data }) {
  const allTasks = data?.allTasks || [];
  const priorityData = [
    { priority: "high", value: allTasks.filter(task => task.priority === 'high').length, fill: "#dc2626" },
    { priority: "medium", value: allTasks.filter(task => task.priority === 'medium').length, fill: "#f59e0b" },
    { priority: "low", value: allTasks.filter(task => task.priority === 'low').length, fill: "#10b981" },
  ].filter(item => item.value > 0);

  const chartConfig = {
    high: {
      label: "High",
      color: "#dc2626",
    },
    medium: {
      label: "Medium", 
      color: "#f59e0b",
    },
    low: {
      label: "Low",
      color: "#10b981",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Distribution</CardTitle>
        <CardDescription>
          Task priority breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={priorityData}
              dataKey="value"
              nameKey="priority"
              cx="50%"
              cy="50%"
              outerRadius={80}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ManagerCharts({ data }) {
  // Mock data for demonstration - in real app, this would come from props or API
  const mockTaskData = data?.allTasks || [
    { status: 'pending', priority: 'high', createdAt: new Date().toISOString() },
    { status: 'in-progress', priority: 'medium', createdAt: new Date().toISOString() },
    { status: 'completed', priority: 'low', createdAt: new Date().toISOString() },
  ];

  const mockSalaryData = {
    totalSalary: 15000, // Total salary received by manager
    totalFundUsed: 8500 // Total fund used in tasks created by manager
  };

  // Generate weekly task data
  const getCurrentWeekData = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
      const dayTasks = mockTaskData.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === day.toDateString();
      });

      weekDays.push({
        day: dayName,
        date: day.toISOString(),
        pending: dayTasks.filter(t => t.status === 'pending').length + Math.floor(Math.random() * 3),
        inProgress: dayTasks.filter(t => t.status === 'in-progress').length + Math.floor(Math.random() * 2),
        completed: dayTasks.filter(t => t.status === 'completed').length + Math.floor(Math.random() * 4),
      });
    }
    
    return weekDays;
  };

  const weeklyData = getCurrentWeekData();

  const chartConfig = {
    pending: {
      label: "Pending",
      color: "#ff7f00",
    },
    inProgress: {
      label: "In Progress", 
      color: "#2563eb",
    },
    completed: {
      label: "Completed",
      color: "#16a34a",
    },
  };

  return (
    <div className="flex gap-4 h-[300px]">
      {/* Chart Section - 80% width */}
      <div className="flex-1 grid grid-cols-4 gap-4" style={{width: '80%'}}>
        {/* 1. Pie Chart */}
        <div className="relative z-0">
          <TaskStatusPieChart data={data} />
        </div>

        {/* 2. Bar Chart */}
        <Card className="relative z-0">
          <CardHeader>
            <CardTitle>Weekly Tasks</CardTitle>
            <CardDescription>
              Daily task status for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#ff7f00"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="inProgress"
                  stackId="a"
                  fill="#2563eb"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 3. Donut Chart */}
        <div className="relative z-0">
          <ProjectStatusDonutChart data={data} />
        </div>

        {/* 4. Priority Pie Chart */}
        <div className="relative z-0">
          <PriorityPieChart data={data} />
        </div>
      </div>

      {/* Stats Cards Section - 20% width */}
      <div className="flex flex-col gap-4" style={{width: '20%'}}>
        {/* Total Salary Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md flex-1">
          <CardContent className="flex flex-col justify-center items-center p-4 h-full">
            <div className="text-center w-full">
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Total Salary</p>
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${mockSalaryData.totalSalary.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 font-medium">Received</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Fund Used Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-md flex-1">
          <CardContent className="flex flex-col justify-center items-center p-4 h-full">
            <div className="text-center w-full">
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Total Fund Used</p>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                ${mockSalaryData.totalFundUsed.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 font-medium">In Tasks Created</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
