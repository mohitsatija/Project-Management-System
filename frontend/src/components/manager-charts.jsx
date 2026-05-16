import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie, Label, Sector } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"

// Interactive Task Status Pie Chart Component
function TaskStatusPieChart({ data }) {
  const id = "task-status-pie"
  
  // Calculate task status from real data
  const allTasks = data?.allTasks || [];
  const taskStatusData = [
    { status: 'pending', count: allTasks.filter(task => task.status === 'pending').length, fill: "#ff7f00" },
    { status: 'in-progress', count: allTasks.filter(task => task.status === 'in-progress').length, fill: "#2563eb" },
    { status: 'completed', count: allTasks.filter(task => task.status === 'completed').length, fill: "#16a34a" }
  ].filter(item => item.count > 0);

  const [activeStatus, setActiveStatus] = React.useState(taskStatusData[0]?.status || 'pending');

  const activeIndex = React.useMemo(
    () => taskStatusData.findIndex((item) => item.status === activeStatus),
    [activeStatus, taskStatusData]
  )

  const chartConfig = {
    count: {
      label: "Tasks",
    },
    pending: {
      label: "Pending",
      color: "#ff7f00",
    },
    "in-progress": {
      label: "In Progress", 
      color: "#2563eb",
    },
    completed: {
      label: "Completed",
      color: "#16a34a",
    },
  };

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle className="text-lg">Task Status</CardTitle>
          <CardDescription className="text-sm">Task distribution</CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger className="ml-auto h-7 w-[120px] rounded-lg pl-2.5">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>          <SelectContent align="end" className="rounded-xl">
            {taskStatusData.map((task) => (
              <SelectItem key={task.status} value={task.status} className="rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: task.fill }}
                  />
                  {chartConfig[task.status]?.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent></Select>
      </CardHeader>      <CardContent className="flex flex-1 justify-center pb-4">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[180px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />            <Pie
              data={taskStatusData}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 20}
                    innerRadius={outerRadius + 10}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {taskStatusData[activeIndex]?.count || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          Tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Interactive Priority Pie Chart Component
function PriorityPieChart({ data }) {
  const id = "priority-pie"
  
  // Calculate priority distribution from real data
  const allTasks = data?.allTasks || [];
  const priorityData = [
    { priority: 'high', count: allTasks.filter(task => task.priority === 'high').length, fill: "#dc2626" },
    { priority: 'medium', count: allTasks.filter(task => task.priority === 'medium').length, fill: "#f59e0b" },
    { priority: 'low', count: allTasks.filter(task => task.priority === 'low').length, fill: "#10b981" }
  ].filter(item => item.count > 0);

  const [activePriority, setActivePriority] = React.useState(priorityData[0]?.priority || 'high');

  const activeIndex = React.useMemo(
    () => priorityData.findIndex((item) => item.priority === activePriority),
    [activePriority, priorityData]
  )

  const chartConfig = {
    count: {
      label: "Tasks",
    },
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
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle className="text-lg">Priority Distribution</CardTitle>
          <CardDescription className="text-sm">Task priority breakdown</CardDescription>
        </div>
        <Select value={activePriority} onValueChange={setActivePriority}>
          <SelectTrigger className="ml-auto h-7 w-[120px] rounded-lg pl-2.5">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>          <SelectContent align="end" className="rounded-xl">
            {priorityData.map((priority) => (
              <SelectItem key={priority.priority} value={priority.priority} className="rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: priority.fill }}
                  />
                  {chartConfig[priority.priority]?.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent></Select>
      </CardHeader>      <CardContent className="flex flex-1 justify-center pb-4">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[180px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />            <Pie
              data={priorityData}
              dataKey="count"
              nameKey="priority"
              innerRadius={50}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 20}
                    innerRadius={outerRadius + 10}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {priorityData[activeIndex]?.count || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          Tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Interactive Project Status Pie Chart Component
function ProjectStatusDonutChart({ data }) {
  const id = "project-status-pie"
  
  // Calculate project status from real data
  const allProjects = data?.allProjects || [];
  const projectStatusData = [
    { status: 'pending', count: allProjects.filter(project => project.status === 'pending').length, fill: "#ff7f00" },
    { status: 'in-progress', count: allProjects.filter(project => project.status === 'in-progress').length, fill: "#2563eb" },
    { status: 'completed', count: allProjects.filter(project => project.status === 'completed').length, fill: "#16a34a" }
  ].filter(item => item.count > 0);

  const [activeStatus, setActiveStatus] = React.useState(projectStatusData[0]?.status || 'pending');

  const activeIndex = React.useMemo(
    () => projectStatusData.findIndex((item) => item.status === activeStatus),
    [activeStatus, projectStatusData]
  )

  const totalProjects = allProjects.length;

  const chartConfig = {
    count: {
      label: "Projects",
    },
    pending: {
      label: "Pending",
      color: "#ff7f00",
    },
    "in-progress": {
      label: "In Progress", 
      color: "#2563eb",
    },
    completed: {
      label: "Completed",
      color: "#16a34a",
    },
  };

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle className="text-lg">Project Status</CardTitle>
          <CardDescription className="text-sm">Total: {totalProjects}</CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger className="ml-auto h-7 w-[120px] rounded-lg pl-2.5">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>          <SelectContent align="end" className="rounded-xl">
            {projectStatusData.map((project) => (
              <SelectItem key={project.status} value={project.status} className="rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: project.fill }}
                  />
                  {chartConfig[project.status]?.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>      <CardContent className="flex flex-1 justify-center pb-4">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[180px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />            <Pie
              data={projectStatusData}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 20}
                    innerRadius={outerRadius + 10}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {projectStatusData[activeIndex]?.count || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          Projects
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Weekly Due Tasks Bar Chart Component - Interactive with status breakdown
function WeeklyDueTasksChart({ data }) {
  // Calculate weekly due tasks from real data
  const getWeeklyDueTasks = () => {
    if (!data?.allTasks) return [];
    
    const currentDate = new Date();
    const weekData = [];
    
    // Generate 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter tasks due on this date
      const tasksThisDay = data.allTasks.filter(task => {
        const taskDueDate = new Date(task.dueDate);
        const taskDateStr = taskDueDate.toISOString().split('T')[0];
        return taskDateStr === dateStr;
      });
      
      // Count by status
      const pending = tasksThisDay.filter(t => t.status === 'pending').length;
      const inProgress = tasksThisDay.filter(t => t.status === 'in-progress').length;
      const completed = tasksThisDay.filter(t => t.status === 'completed').length;
      
      weekData.push({
        date: dateStr,
        day: dayName,
        pending,
        "in-progress": inProgress,
        completed
      });
    }
    
    return weekData;
  };
  const chartData = getWeeklyDueTasks();
  
  // Check if there's any data for the current week
  const hasData = chartData.some(day => day.pending + day["in-progress"] + day.completed > 0);

  const chartConfig = {
    pending: {
      label: "Pending",
      color: "#ff7f00",
    },
    "in-progress": {
      label: "In Progress",
      color: "#2563eb",
    },
    completed: {
      label: "Completed",
      color: "#16a34a",
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Due Tasks</CardTitle>
        <CardDescription>Tasks due this week by status</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {!hasData ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground text-lg font-medium">NO DUE DATE</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Bar
                dataKey="pending"
                stackId="a"
                fill="var(--color-pending)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="in-progress"
                stackId="a"
                fill="var(--color-in-progress)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="completed"
                stackId="a"
                fill="var(--color-completed)"
                radius={[4, 4, 0, 0]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const item = chartData.find(d => d.day === value);
                      if (item) {
                        return new Date(item.date).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      }
                      return value;
                    }}
                  />
                }
                cursor={false}
                defaultIndex={1}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// Main ManagerCharts Component
export function ManagerCharts({ data }) {
  return (
    <div className="space-y-4">
      {/* Row 2: 4 Charts - matching Row 1 widths exactly */}
      <div className="flex gap-4 h-96">
        {/* Weekly Due Tasks Chart - same as Welcome card width (30%) */}
        <div style={{ width: '30%' }}>
          <WeeklyDueTasksChart data={data} />
        </div>
        
        {/* Task Status Chart - 23.33% width to match row 1 cards */}
        <div style={{ width: '23.33%' }}>
          <TaskStatusPieChart data={data} />
        </div>
        
        {/* Task Priority Chart - 23.33% width to match row 1 cards */}
        <div style={{ width: '23.33%' }}>
          <PriorityPieChart data={data} />
        </div>
        
        {/* Project Status Chart - 23.33% width to match row 1 cards */}
        <div style={{ width: '23.33%' }}>
          <ProjectStatusDonutChart data={data} />
        </div>
      </div>
    </div>
  );
}
