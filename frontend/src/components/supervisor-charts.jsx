""

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

// Interactive Project Status Pie Chart Component
function ProjectStatusPieChart({ data }) {
  // Calculate project status distribution from all projects
  const allProjects = data?.allProjects || [];
  const projectStatusData = [
    { status: "pending", value: allProjects.filter(project => project.status === 'pending').length, fill: "var(--color-pending)" },
    { status: "inprogress", value: allProjects.filter(project => project.status === 'in-progress').length, fill: "var(--color-inprogress)" },
    { status: "completed", value: allProjects.filter(project => project.status === 'completed').length, fill: "var(--color-completed)" },
  ].filter(item => item.value > 0);

  const [activeStatus, setActiveStatus] = React.useState(projectStatusData[0]?.status || "pending");
  
  const activeIndex = React.useMemo(
    () => projectStatusData.findIndex((item) => item.status === activeStatus),
    [activeStatus, projectStatusData]
  );

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

  const id = "project-status-pie";

  if (projectStatusData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
          <CardDescription>No projects available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card data-chart={id} className="flex flex-col relative z-0">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Project Status</CardTitle>
          <CardDescription>Overall project completion status</CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5 relative z-20">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl relative z-30">
            {projectStatusData.map((item) => (
              <SelectItem key={item.status} value={item.status} className="rounded-lg [&_span]:flex">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: item.fill }}
                  />
                  {chartConfig[item.status]?.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0 relative z-0">
        <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px] relative z-0">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={projectStatusData}
              dataKey="value"
              nameKey="status"
              innerRadius={40}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={(props) => {
                const { outerRadius = 0, ...otherProps } = props;
                return (
                  <g>
                    <Sector {...otherProps} outerRadius={outerRadius + 10} />
                    <Sector {...otherProps} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                  </g>
                );
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox && activeIndex >= 0) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                          {projectStatusData[activeIndex]?.value || 0}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">
                          Projects
                        </tspan>
                      </text>
                    );
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
  // Calculate priority distribution from all projects
  const allProjects = data?.allProjects || [];
  const priorityData = [
    { priority: "high", value: allProjects.filter(project => project.priority === 'high').length, fill: "var(--color-high)" },
    { priority: "medium", value: allProjects.filter(project => project.priority === 'medium').length, fill: "var(--color-medium)" },
    { priority: "low", value: allProjects.filter(project => project.priority === 'low').length, fill: "var(--color-low)" },
  ].filter(item => item.value > 0);

  const [activePriority, setActivePriority] = React.useState(priorityData[0]?.priority || "high");
  
  const activeIndex = React.useMemo(
    () => priorityData.findIndex((item) => item.priority === activePriority),
    [activePriority, priorityData]
  );

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
      color: "#16a34a",
    },
  };

  const id = "priority-pie";

  if (priorityData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Levels</CardTitle>
          <CardDescription>No projects available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card data-chart={id} className="flex flex-col relative z-0">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Priority Levels</CardTitle>
          <CardDescription>Project distribution by priority</CardDescription>
        </div>
        <Select value={activePriority} onValueChange={setActivePriority}>
          <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5 relative z-20">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl relative z-30">
            {priorityData.map((item) => (
              <SelectItem key={item.priority} value={item.priority} className="rounded-lg [&_span]:flex">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: item.fill }}
                  />
                  {chartConfig[item.priority]?.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0 relative z-0">
        <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px] relative z-0">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={priorityData}
              dataKey="value"
              nameKey="priority"
              innerRadius={40}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={(props) => {
                const { outerRadius = 0, ...otherProps } = props;
                return (
                  <g>
                    <Sector {...otherProps} outerRadius={outerRadius + 10} />
                    <Sector {...otherProps} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                  </g>
                );
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox && activeIndex >= 0) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                          {priorityData[activeIndex]?.value || 0}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">
                          Projects
                        </tspan>
                      </text>
                    );
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

export function SupervisorCharts({ data }) {
  if (!data) return null;

  // Generate current week data based on real projects
  const getCurrentWeekData = () => {
    const today = new Date();
    const weekDays = [];
    
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
      const dayString = day.getFullYear() + '-' + 
                       String(day.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(day.getDate()).padStart(2, '0');
      
      // Filter projects for this specific day based on due date
      const dayProjects = (data.allProjects || []).filter(project => {
        if (!project.dueDate) return false;
        const projectDate = new Date(project.dueDate);
        const projectDueDate = projectDate.getFullYear() + '-' + 
                           String(projectDate.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(projectDate.getDate()).padStart(2, '0');
        return projectDueDate === dayString;
      });
      
      // Count projects by status for this day
      const pending = dayProjects.filter(project => project.status === 'pending').length;
      const inProgress = dayProjects.filter(project => project.status === 'in-progress').length;
      const completed = dayProjects.filter(project => project.status === 'completed').length;
      
      weekDays.push({
        date: dayString,
        day: dayName,
        pending,
        completed,
        inProgress
      });
    }
    
    return weekDays;
  };
  const weeklyData = getCurrentWeekData();
  
  // Check if there's any project data for the current week
  const hasData = weeklyData.some(day => day.pending + day.inProgress + day.completed > 0);

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
    <div className="grid gap-4 md:grid-cols-3 relative z-0">
      {/* Weekly Project Status Chart */}
      <Card className="relative z-0">
        <CardHeader>
          <CardTitle>Current Week Projects</CardTitle>
          <CardDescription>
            Daily project status for this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-muted-foreground text-lg font-medium">NO DUE DATE</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
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
                  fill="var(--color-pending)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="inProgress"
                  stackId="a"
                  fill="var(--color-inProgress)"
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
                        const dayData = weeklyData.find(d => d.day === value);
                        if (dayData) {
                          return new Date(dayData.date).toLocaleDateString("en-US", {
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
                />
              </BarChart>
            </ChartContainer>
          )}        </CardContent>
      </Card>

      {/* Interactive Project Status Pie Chart */}
      <div className="relative z-0">
        <ProjectStatusPieChart data={data} />
      </div>

      {/* Interactive Priority Pie Chart */}
      <div className="relative z-0">
        <PriorityPieChart data={data} />
      </div>
    </div>
  );
}
