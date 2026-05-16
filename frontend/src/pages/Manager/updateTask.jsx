import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ManagerLayout } from '@/components/manager-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  IconCalendar,
  IconPlus,
  IconX,
  IconUsers,
  IconPaperclip,
  IconCurrencyDollar,  IconTrash,
  IconArrowLeft,
  IconEdit,
  IconFolder,
  IconChecks,
  IconClock,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { taskAPI, userAPI, projectAPI } from '@/utils/api';

const formatDate = (date) => {
  if (!date) return '';
  // Convert string to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Check if it's a valid date
  if (dateObj instanceof Date && !isNaN(dateObj)) {
    return dateObj.toLocaleDateString('en-GB');
  }
  return '';
};

const UpdateTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    dueDate: null,
    assignedTo: [],
    attachments: [],
    todoChecklist: [],
    taskBudget: '',
    projectId: '',
    status: '',
  });

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [memberSalaries, setMemberSalaries] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [attachmentInputs, setAttachmentInputs] = useState([{ id: Date.now(), value: '' }]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTask();
    fetchUsers();
    fetchProjects();
  }, [id]);

  const fetchTask = async () => {
    try {
      const data = await taskAPI.getTaskById(id);
      const taskData = data; // Backend returns task directly
      setTask(taskData);
      
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        priority: taskData.priority || '',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        assignedTo: taskData.assignedTo?.map(user => user._id) || [],
        attachments: taskData.attachments || [],
        todoChecklist: taskData.todoChecklist || [],
        taskBudget: taskData.taskBudget?.toString() || '',
        projectId: taskData.projectId?._id || '',
        status: taskData.status || 'pending',
      });

      // Set member salaries from task data
      if (taskData.memberSalaries) {
        setMemberSalaries(taskData.memberSalaries);
      }

      setAttachmentInputs(
        taskData.attachments?.length > 0
          ? taskData.attachments.map((att, idx) => ({ id: Date.now() + idx, value: att }))
          : [{ id: Date.now(), value: '' }]
      );
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to fetch task');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectAPI.getProjects();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addUser = (user) => {
    if (!formData.assignedTo.find((userId) => userId === user._id)) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, user._id],
      }));
      
      // Initialize salary for new member if project task
      if (formData.projectId) {
        setMemberSalaries(prev => ({
          ...prev,
          [user._id]: ''
        }));
      }
    }
    setUserSearch('');
    setIsDrawerOpen(false);
  };

  const removeUser = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((id) => id !== userId),
    }));
    
    // Remove salary for removed member
    setMemberSalaries(prev => {
      const newSalaries = { ...prev };
      delete newSalaries[userId];
      return newSalaries;
    });
  };

  const updateMemberSalary = (userId, salary) => {
    setMemberSalaries(prev => ({
      ...prev,
      [userId]: salary
    }));
  };

  const calculateTaskBudget = () => {
    if (formData.projectId) {
      return Object.values(memberSalaries).reduce((sum, salary) => {
        return sum + (parseFloat(salary) || 0);
      }, 0);
    }
    return parseFloat(formData.taskBudget) || 0;
  };
  const addTodoItem = () => {
    if (todoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        todoChecklist: [...prev.todoChecklist, {
          text: todoInput.trim(),
          completed: false
        }]
      }));
      setTodoInput('');
    }
  };
  const removeTodoItem = (index) => {
    setFormData(prev => ({
      ...prev,
      todoChecklist: prev.todoChecklist.filter((_, i) => i !== index)
    }));
  };
  const toggleTodoItem = async (index) => {
    const updatedChecklist = formData.todoChecklist.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo
    );

    // Update local state immediately for better UX
    setFormData(prev => ({
      ...prev,
      todoChecklist: updatedChecklist
    }));

    try {
      // Send update to backend to trigger automatic status changes
      await taskAPI.updateTaskChecklist(id, updatedChecklist);
      
      // Fetch updated task to get the new status
      await fetchTask();
      
      toast.success('Task checklist updated successfully');
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Failed to update checklist');
      // Revert the optimistic update on error
      await fetchTask();
    }
  };

  const addAttachmentInput = () => {
    setAttachmentInputs((prev) => [...prev, { id: Date.now(), value: '' }]);
  };

  const removeAttachmentInput = (inputId) => {
    if (attachmentInputs.length === 1) return;
    setAttachmentInputs((prev) => prev.filter((item) => item.id !== inputId));
  };

  const updateAttachmentInput = (inputId, value) => {
    setAttachmentInputs((prev) =>
      prev.map((item) => (item.id === inputId ? { ...item, value } : item))
    );
  };

  const getSelectedProject = () => {
    if (!formData.projectId) return null;
    return projects.find(p => p._id === formData.projectId);
  };

  const getAssignedUsers = () => {
    return users.filter(user => formData.assignedTo.includes(user._id));
  };

  const getFilteredUsers = () => {
    return users.filter(user => 
      (user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
       user.name?.toLowerCase().includes(userSearch.toLowerCase())) &&
      user.role === 'member'
    );
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.priority || !formData.dueDate || formData.assignedTo.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const attachments = attachmentInputs
        .map((input) => input.value.trim())
        .filter((value) => value.length > 0);

      const calculatedTaskBudget = calculateTaskBudget();
      
      // Validate budget if project is selected
      const selectedProject = getSelectedProject();
      if (selectedProject && calculatedTaskBudget > (selectedProject.currentBudget + (task.taskBudget || 0))) {
        toast.error(`Insufficient budget! Available: $${(selectedProject.currentBudget + (task.taskBudget || 0)).toLocaleString()}, Required: $${calculatedTaskBudget.toLocaleString()}`);
        return;
      }

      const updateData = {
        ...formData,
        attachments,
        taskBudget: calculatedTaskBudget,
        memberSalaries: formData.projectId ? memberSalaries : {},
        projectId: formData.projectId || null,
      };

      await taskAPI.updateTask(id, updateData);
      toast.success('Task updated successfully');
      fetchTask();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await taskAPI.deleteTask(id);
      toast.success('Task deleted successfully');
      navigate('/manager/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <ManagerLayout>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Loading Task...</h1>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/manager/tasks')} className="h-9 w-9 p-0">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Update Task</h1>
              <p className="text-muted-foreground">Modify task details and manage assignments</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">            <Button onClick={handleUpdate} disabled={saving} className="bg-primary hover:bg-primary/90">
              <IconEdit className="h-4 w-4 mr-2" />
              {saving ? 'Updating...' : 'Update Task'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the task and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Label */}
            {task?.projectId && (
              <Card className="border-l-4 border-blue-400 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <IconFolder className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        This task belongs to project:
                      </p>
                      <p className="text-lg font-semibold text-blue-900">
                        {task.projectId.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Task Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter task title"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your task..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>                  {/* Priority and Status Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Due Date and Project Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Due Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal mt-1',
                              !formData.dueDate && 'text-muted-foreground'
                            )}
                          >
                            <IconCalendar className="mr-2 h-4 w-4" />
                            {formData.dueDate ? formatDate(formData.dueDate) : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.dueDate}
                            onSelect={(date) => handleInputChange('dueDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="project" className="text-sm font-medium">Project</Label>
                      <Select value={formData.projectId || "individual"} onValueChange={(value) => handleInputChange('projectId', value === "individual" ? "" : value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[300px]">
                          <SelectItem value="individual">Individual Task</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project._id} value={project._id} className="break-words">
                              <span className="truncate max-w-[250px] block" title={project.title}>
                                {project.title}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <IconCurrencyDollar className="h-5 w-5" />
                  Budget Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.projectId ? (
                  <div>
                    <Label className="text-sm font-medium">Task Budget (Auto-calculated from member salaries)</Label>
                    <div className="p-4 bg-blue-50 rounded-lg mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Task Budget:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${calculateTaskBudget().toLocaleString()}
                        </span>
                      </div>
                      {getSelectedProject() && (
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-600">Available Budget:</span>
                          <span className={`font-medium ${calculateTaskBudget() > (getSelectedProject().currentBudget + (task.taskBudget || 0)) ? 'text-red-600' : 'text-green-600'}`}>
                            ${(getSelectedProject().currentBudget + (task.taskBudget || 0)).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="taskBudget" className="text-sm font-medium">Task Budget</Label>
                    <Input
                      id="taskBudget"
                      type="number"
                      value={formData.taskBudget}
                      onChange={(e) => handleInputChange('taskBudget', e.target.value)}
                      placeholder="Enter task budget"
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task Checklist Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <IconChecks className="h-5 w-5" />
                  Task Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new checklist item"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodoItem()}
                    className="flex-1"
                  />
                  <Button onClick={addTodoItem} size="sm">
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.todoChecklist.map((todo, index) => (
                    <div key={todo._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodoItem(index)}
                        />
                        <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.text}
                        </span>
                      </div>
                      <Button
                        onClick={() => removeTodoItem(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.todoChecklist.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No checklist items yet. Add one above to get started.
                    </p>
                  )}
                </div>

                {formData.todoChecklist.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span className="font-medium">
                        {formData.todoChecklist.filter(item => item.completed).length} / {formData.todoChecklist.length} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${formData.todoChecklist.length > 0 ? (formData.todoChecklist.filter(item => item.completed).length / formData.todoChecklist.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Assignments & Attachments */}
          <div className="space-y-6">
            {/* Assigned Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconUsers className="h-5 w-5" />
                  Assigned Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <IconPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Add User</DrawerTitle>
                      <DrawerDescription>Search and select users to assign to this task</DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4">
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="mb-4"
                      />

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <Button
                            key={user._id}
                            variant="ghost"
                            className="w-full justify-start p-3 h-auto"
                            onClick={() => addUser(user)}
                            disabled={formData.assignedTo.includes(user._id)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <DrawerFooter>
                      <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                        Close
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <div className="space-y-3">
                  {getAssignedUsers().map((user) => (
                    <div key={user._id} className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeUser(user._id)}>
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Member Salary Input for Project Tasks */}
                      {formData.projectId && (
                        <div className="ml-3">
                          <Label className="text-xs text-muted-foreground">Salary for {user.name}</Label>
                          <Input
                            type="number"
                            placeholder="Enter salary"
                            value={memberSalaries[user._id] || ''}
                            onChange={(e) => updateMemberSalary(user._id, e.target.value)}
                            className="text-sm h-8"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {formData.assignedTo.length === 0 && (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No users assigned yet. Click "Add User" to assign users to this task.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconPaperclip className="h-5 w-5" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {attachmentInputs.map((input) => (
                    <div key={input.id} className="flex gap-2">
                      <Input
                        value={input.value}
                        onChange={(e) => updateAttachmentInput(input.id, e.target.value)}
                        placeholder="Enter attachment URL or name"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAttachmentInput(input.id)}
                        disabled={attachmentInputs.length === 1}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button variant="outline" onClick={addAttachmentInput} className="w-full">
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Attachment
                </Button>
              </CardContent>
            </Card>

            {/* Task Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconClock className="h-5 w-5" />
                  Task Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{task?.createdAt ? formatDate(task.createdAt) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{task?.updatedAt ? formatDate(task.updatedAt) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator:</span>
                    <span className="font-medium">{task?.createdBy?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Budget:</span>
                    <span className="font-medium text-green-600">
                      ${(task?.taskBudget || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default UpdateTask;