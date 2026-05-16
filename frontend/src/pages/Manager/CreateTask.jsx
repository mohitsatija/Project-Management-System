import React, { useState, useEffect } from 'react'
import { ManagerLayout } from "@/components/manager-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { 
  IconCalendar, 
  IconPlus, 
  IconX, 
  IconUsers, 
  IconPaperclip 
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { taskAPI, userAPI, projectAPI } from '@/utils/api'

// Simple date formatter
const formatDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-GB')
}

const CreateTask = () => {  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
    taskBudget: '',
    memberSalary: '',
    projectId: 'individual'
  })

  const [memberSalaries, setMemberSalaries] = useState({}) // Store individual member salaries

  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [todoInput, setTodoInput] = useState('')
  const [attachmentInputs, setAttachmentInputs] = useState([{ id: Date.now(), value: '' }])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    fetchUsers()
    fetchProjects()
  }, [])
  
  const fetchUsers = async () => {
    try {
      const data = await userAPI.getUsers()
      console.log('Fetched users data:', data)
      // Backend returns array directly, not wrapped in users property
      setUsers(Array.isArray(data) ? data : data.users || [])    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error("Failed to fetch users. Please try again.")
    }
  }

  const fetchProjects = async () => {
    try {
      const data = await projectAPI.getProjects()
      console.log('Fetched projects data:', data)
      setProjects(Array.isArray(data.projects) ? data.projects : [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error("Failed to fetch projects. Please try again.")
    }
  }
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  };

  const addTodoItem = () => {
    if (todoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        todoChecklist: [...prev.todoChecklist, {
          text: todoInput.trim(),
          completed: false
        }]
      }))
      setTodoInput('')
    }
  }
  const removeTodoItem = (index) => {
    setFormData(prev => ({
      ...prev,
      todoChecklist: prev.todoChecklist.filter((_, i) => i !== index)
    }))
  }
  const addAttachmentInput = () => {
    setAttachmentInputs(prev => [...prev, { id: Date.now(), value: '' }])
  }

  const removeAttachmentInput = (id) => {
    setAttachmentInputs(prev => prev.filter(item => item.id !== id))
    const attachmentIndex = attachmentInputs.findIndex(item => item.id === id)
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== attachmentIndex)
    }))
  }

  const handleAttachmentChange = (id, value) => {
    const index = attachmentInputs.findIndex(item => item.id === id)
    const newAttachments = [...formData.attachments]
    newAttachments[index] = value
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }))
  }
  const addUserToAssignment = (user) => {
    if (!formData.assignedTo.includes(user._id)) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, user._id]
      }))
      // Initialize salary for new member
      setMemberSalaries(prev => ({
        ...prev,
        [user._id]: ''
      }))
    }
    setUserSearch('')
  }

  const removeUserFromAssignment = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(id => id !== userId)
    }))
    // Remove salary for removed member
    setMemberSalaries(prev => {
      const newSalaries = { ...prev }
      delete newSalaries[userId]
      return newSalaries
    })
  }

  const updateMemberSalary = (userId, salary) => {
    setMemberSalaries(prev => ({
      ...prev,
      [userId]: salary
    }))
  }

  // Calculate total task budget from member salaries
  const calculateTaskBudget = () => {
    return Object.values(memberSalaries).reduce((sum, salary) => {
      return sum + (parseFloat(salary) || 0)
    }, 0)
  }
  // Get selected project details
  const getSelectedProject = () => {
    if (formData.projectId === 'individual' || !formData.projectId) return null;
    return projects.find(p => p._id === formData.projectId);  };
  
  const getAssignedUsers = () => {
    return users.filter(user => formData.assignedTo.includes(user._id));
  };

  const getFilteredUsers = () => {
    return users.filter(user => 
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.name.toLowerCase().includes(userSearch.toLowerCase())
    );
  };
  
  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: '',
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
      taskBudget: '',
      memberSalary: '',
      projectId: 'individual'
    })
    setMemberSalaries({})
    setAttachmentInputs([{ id: Date.now(), value: '' }])
    setTodoInput('')
    setUserSearch('')
  }
  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validate required fields
      if (!formData.title || !formData.priority || !formData.dueDate || formData.assignedTo.length === 0) {
        toast.error("Please fill in all required fields")
        return
      }

      // Calculate total task budget from member salaries
      const calculatedTaskBudget = calculateTaskBudget()
      
      // Validate budget if project is selected
      const selectedProject = getSelectedProject()
      if (selectedProject && calculatedTaskBudget > selectedProject.currentBudget) {
        toast.error(`Insufficient budget! Available: $${selectedProject.currentBudget}, Required: $${calculatedTaskBudget}`)
        return
      }

      const taskData = {
        ...formData,
        attachments: formData.attachments.filter(att => att.trim() !== ''),
        projectId: formData.projectId === "individual" ? null : formData.projectId,
        taskBudget: calculatedTaskBudget,
        memberSalaries: memberSalaries
      }

      await taskAPI.createTask(taskData)
      toast.success("Task has been created successfully!")
      clearForm()
      setIsDrawerOpen(false)
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error("Failed to create task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ManagerLayout>
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Create Task</h1>
            
            <div className="space-y-6">
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Create App UI"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe task"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>              {/* Project Selection */}
              <div className="space-y-2">
                <Label>Project Assignment</Label>
                <Select value={formData.projectId || "individual"} onValueChange={(value) => handleInputChange('projectId', value === "individual" ? "" : value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project or create individual task" className="text-muted-foreground" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Task (No Project)</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority and Due Date */}              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select value={formData.priority || undefined} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" className="text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dueDate && "text-muted-foreground"
                        )}                      >
                        <IconCalendar className="mr-2 h-4 w-4" />
                        {formData.dueDate ? formatDate(formData.dueDate) : "dd/mm/yyyy"}
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
              </div>              {/* Assign To */}
              <div className="space-y-2">
                <Label>Assign To *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IconUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email or name..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      onClick={fetchUsers} 
                      variant="outline" 
                      size="icon"
                      title="Refresh Users"
                    >
                      <IconUsers className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Search Results */}
                  {userSearch && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {getFilteredUsers().map(user => (
                        <button
                          key={user._id}
                          className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between w-full text-left"
                          onClick={() => addUserToAssignment(user)}
                          onKeyDown={(e) => e.key === 'Enter' && addUserToAssignment(user)}
                        >
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <IconPlus className="h-4 w-4" />
                        </button>
                      ))}
                      {getFilteredUsers().length === 0 && (
                        <p className="p-2 text-muted-foreground">No users found</p>
                      )}
                    </div>
                  )}

                  {/* Selected Users with Salaries (when project is selected) */}
                  {formData.projectId !== 'individual' && formData.assignedTo.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Member Salaries</Label>
                      {getAssignedUsers().map(user => (
                        <div key={user._id} className="flex items-center justify-between p-2 bg-gray-50 border rounded" style={{height: '40px'}}>
                          <span className="font-medium text-sm">{user.name}</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Salary"
                              value={memberSalaries[user._id] || ''}
                              onChange={(e) => updateMemberSalary(user._id, e.target.value)}
                              className="w-24 h-8 text-sm"
                            />
                            <Button
                              onClick={() => removeUserFromAssignment(user._id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-1"
                            >
                              <IconX className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Users as Badges (when individual task) */}
                  {formData.projectId === 'individual' && (
                    <div className="flex flex-wrap gap-2">
                      {getAssignedUsers().map(user => (
                        <Badge key={user._id} variant="secondary" className="flex items-center gap-1">
                          {user.name}
                          <IconX 
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeUserFromAssignment(user._id)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>              {/* Budget Information */}
              {formData.projectId !== 'individual' && (
                <div className="space-y-2">
                  <Label>Task Budget (Auto-calculated)</Label>
                  <div className="p-3 bg-gray-50 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Task Budget:</span>
                      <span className="text-lg font-bold text-blue-600">${calculateTaskBudget().toLocaleString()}</span>
                    </div>
                    {getSelectedProject() && (
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-gray-600">Available Budget:</span>
                        <span className={`font-medium ${calculateTaskBudget() > getSelectedProject().currentBudget ? 'text-red-600' : 'text-green-600'}`}>
                          ${getSelectedProject().currentBudget.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Task Checklist */}
              <div className="space-y-2">
                <Label>Task Checklist</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Task"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodoItem()}
                  />
                  <Button onClick={addTodoItem} variant="outline" size="icon">
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
                {/* Checklist Items */}
                <div className="space-y-2">                  {formData.todoChecklist.map((todo, index) => (
                    <div key={`todo-${index}-${todo.text}`} className="flex items-center justify-between p-2 border rounded">
                      <span>{todo.text}</span>
                      <Button
                        onClick={() => removeTodoItem(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>{/* Add Attachments */}
              <div className="space-y-2">
                <Label>Add Attachments</Label>
                <div className="space-y-2">
                  {attachmentInputs.map((attachment) => (
                    <div key={attachment.id} className="flex gap-2">
                      <div className="relative flex-1">
                        <IconPaperclip className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter attachment URL or name"
                          value={formData.attachments[attachmentInputs.findIndex(item => item.id === attachment.id)] || ''}
                          onChange={(e) => handleAttachmentChange(attachment.id, e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {attachmentInputs.length > 1 && (
                        <Button
                          onClick={() => removeAttachmentInput(attachment.id)}
                          variant="outline"
                          size="icon"
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button onClick={addAttachmentInput} variant="outline" className="w-full">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Attachment
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button className="flex-1">Create Task</Button>
                  </DrawerTrigger>                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Confirm Task Creation</DrawerTitle>
                      <DrawerDescription>
                        {formData.projectId !== 'individual' && getSelectedProject() ? (
                          <div className="space-y-2">
                            <p>Do you want to create this task?</p>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Task Budget:</span>
                                <span className="font-medium">${calculateTaskBudget().toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Available Budget:</span>
                                <span className={`font-medium ${calculateTaskBudget() > getSelectedProject().currentBudget ? 'text-red-600' : 'text-green-600'}`}>
                                  ${getSelectedProject().currentBudget.toLocaleString()}
                                </span>
                              </div>
                              {calculateTaskBudget() > getSelectedProject().currentBudget && (
                                <p className="text-red-600 font-medium">⚠️ Insufficient budget!</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          "Do you want to create this task?"
                        )}
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Yes, Create Task"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                        Cancel
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
                
                <Button 
                  variant="outline" 
                  onClick={clearForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}

export default CreateTask