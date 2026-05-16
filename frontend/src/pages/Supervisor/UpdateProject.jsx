import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SupervisorLayout } from '@/components/supervisor-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  IconCalendar,
  IconPlus,
  IconX,
  IconUsers,
  IconPaperclip,
  IconCurrencyDollar,
  IconTrash,
  IconArrowLeft,
  IconEdit,
  IconHistory,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { projectAPI, supervisorAPI, taskAPI } from '@/utils/api';

const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-GB');
};

const UpdateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    dueDate: null,
    assignedTo: [],
    attachments: [],
    totalBudget: '',
    status: '',
  });  const [project, setProject] = useState(null);
  const [managers, setManagers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [budgetHistory, setBudgetHistory] = useState([]);
  const [managerSearch, setManagerSearch] = useState('');
  const [attachmentInputs, setAttachmentInputs] = useState([{ id: Date.now(), value: '' }]);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchManagers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await projectAPI.getProject(id);
      const projectData = data.project;
      setProject(projectData);
      setFormData({
        title: projectData.title || '',
        description: projectData.description || '',
        priority: projectData.priority || '',
        dueDate: projectData.dueDate ? new Date(projectData.dueDate) : null,
        assignedTo: projectData.assignedTo || [],
        attachments: projectData.attachments || [],
        totalBudget: projectData.totalBudget?.toString() || '',
        status: projectData.status || 'pending',
      });
      setTasks(projectData.tasks || []);
      setBudgetHistory(projectData.budgetHistory || []);
      setAttachmentInputs(
        projectData.attachments?.length > 0
          ? projectData.attachments.map((att, idx) => ({ id: Date.now() + idx, value: att }))
          : [{ id: Date.now(), value: '' }]
      );
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };  const fetchManagers = async () => {
    try {
      const data = await supervisorAPI.getManagers();
      setManagers(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBudgetChange = (value) => {
    const newBudget = parseFloat(value) || 0;
    const currentBudget = project?.currentBudget || 0;
    const spentAmount = (project?.totalBudget || 0) - currentBudget;

    if (newBudget < spentAmount) {
      toast.error(`Cannot set budget below spent amount: $${spentAmount.toLocaleString()}`);
      return;
    }

    handleInputChange('totalBudget', value);
  };
  const addManager = (manager) => {
    if (!formData.assignedTo.find((m) => m._id === manager._id)) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, manager],
      }));
    }
    setManagerSearch('');
    setShowManagerDropdown(false);
  };

  const removeManager = (managerId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((m) => m._id !== managerId),
    }));
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
  const deleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      const filteredTasks = tasks.filter((task) => task._id !== taskId);
      setTasks(filteredTasks);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !formData.priority || !formData.totalBudget) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const attachments = attachmentInputs
        .map((input) => input.value.trim())
        .filter((value) => value.length > 0);

      const updateData = {
        ...formData,
        attachments,
        totalBudget: parseFloat(formData.totalBudget),
        budgetHistory: [
          ...budgetHistory,
          {
            id: Date.now().toString(),
            date: new Date(),
            action: 'budget_update',
            previousBudget: project.totalBudget,
            newBudget: parseFloat(formData.totalBudget),
            description: `Budget updated from $${project.totalBudget} to $${parseFloat(formData.totalBudget)}`,
          },
        ],
      };

      await projectAPI.updateProject(id, updateData);
      toast.success('Project updated successfully');
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectAPI.deleteProject(id);
      toast.success('Project deleted successfully');
      navigate('/supervisor/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name?.toLowerCase().includes(managerSearch.toLowerCase()) ||
      manager.email?.toLowerCase().includes(managerSearch.toLowerCase())
  );
  if (loading) {
    return (
      <SupervisorLayout>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Loading Project...</h1>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </SupervisorLayout>
    );
  }

  const currentBudget = project?.currentBudget || 0;
  const spentAmount = (project?.totalBudget || 0) - currentBudget;
  return (
    <SupervisorLayout>
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/supervisor/projects')} className="h-9 w-9 p-0">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Update Project</h1>
              <p className="text-muted-foreground">Modify project details and manage tasks</p>
            </div>
          </div>
            {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/supervisor/projects')} 
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <IconEdit className="h-4 w-4 mr-2" />
              {saving ? 'Updating...' : 'Update Project'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project and all associated data.
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter project title"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your project..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <div>
                      <Label className="text-sm font-medium">Due Date</Label>
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
                <div>
                  <Label htmlFor="totalBudget" className="text-sm font-medium">Total Budget *</Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    placeholder="Enter total budget"
                    min={spentAmount}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum: ${spentAmount.toLocaleString()} (spent amount)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Label className="text-sm text-blue-700 font-medium">Current Budget</Label>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      ${currentBudget.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Label className="text-sm text-red-700 font-medium">Spent Amount</Label>
                    <div className="text-2xl font-bold text-red-600 mt-1">
                      ${spentAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {budgetHistory.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                      <IconHistory className="h-4 w-4" />
                      Budget History
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                      {budgetHistory.map((entry, index) => (
                        <div key={entry.id || `history-${index}`} className="text-sm p-3 bg-white rounded border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{entry.description}</span>
                            <span className="text-muted-foreground text-xs">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Assignments & Attachments */}
          <div className="space-y-6">
            {/* Assigned Managers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconUsers className="h-5 w-5" />
                  Assigned Managers
                </CardTitle>
              </CardHeader>              <CardContent className="space-y-4">
                {/* Manager Search and Assignment */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IconUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search managers by email or name..."
                        value={managerSearch}
                        onChange={(e) => {
                          setManagerSearch(e.target.value);
                          setShowManagerDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowManagerDropdown(managerSearch.length > 0)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      onClick={fetchManagers} 
                      variant="outline" 
                      size="sm"
                      title="Refresh Managers"
                    >
                      <IconUsers className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {showManagerDropdown && managerSearch && (
                    <div className="border rounded-md max-h-40 overflow-y-auto bg-white z-10 shadow-lg">
                      {filteredManagers.map(manager => (
                        <button
                          key={manager._id}
                          className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between w-full text-left"
                          onClick={() => addManager(manager)}
                          disabled={formData.assignedTo.find((m) => m._id === manager._id)}
                        >
                          <div>
                            <p className="font-medium">{manager.name}</p>
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                          </div>
                          <IconPlus className="h-4 w-4" />
                        </button>
                      ))}
                      {filteredManagers.length === 0 && (
                        <p className="p-2 text-muted-foreground">No managers found</p>
                      )}
                    </div>
                  )}

                  {/* Selected Managers */}
                  <div className="space-y-2">
                    {formData.assignedTo.map(manager => (
                      <div key={manager._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{manager.name}</div>
                          <div className="text-xs text-muted-foreground">{manager.email}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeManager(manager._id)}>
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
          </div>
        </div>

        {/* Task List */}
        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task._id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                          {task.priority}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Task</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this task? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTask(task._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Assigned Users ({task.assignedTo.length}):</p>
                        <div className="space-y-2">
                          {task.assignedTo.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center justify-between bg-white p-3 rounded border text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div>
                                  <span className="font-medium">{user.name || 'Unknown User'}</span>
                                  <span className="text-muted-foreground ml-2">({user.email || 'No email'})</span>
                                </div>
                                {user.salary && (
                                  <Badge variant="secondary" className="text-green-600">
                                    ${user.salary.toLocaleString()}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Member
                                </Badge>
                                <span className="text-xs text-muted-foreground">View Only</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Task Details */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</p>
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                            {task.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Budget</p>
                          <p className="font-medium text-green-600 mt-1">
                            ${task.taskBudget?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Date</p>
                          <p className="font-medium mt-1">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Created By</p>
                          <p className="font-medium mt-1">
                            {task.createdBy?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default UpdateProject;