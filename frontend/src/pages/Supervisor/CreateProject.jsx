import React, { useState, useEffect } from 'react'
import { SupervisorLayout } from "@/components/supervisor-layout"
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
  IconPaperclip,
  IconCurrencyDollar
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { projectAPI, supervisorAPI } from '@/utils/api'

// Simple date formatter
const formatDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-GB')
}

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    dueDate: null,
    assignedTo: [],
    attachments: [],
    totalBudget: '',
    managerSalary: ''
  })

  const [managers, setManagers] = useState([])
  const [managerSearch, setManagerSearch] = useState('')
  const [attachmentInputs, setAttachmentInputs] = useState([{ id: Date.now(), value: '' }])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchManagers()
  }, [])

  const fetchManagers = async () => {
    try {
      const data = await supervisorAPI.getManagers()
      console.log('Fetched managers data:', data)

      setManagers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching managers:', error)
      toast.error("Failed to fetch managers. Please try again.")
    } 
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const addManagerToAssignment = (manager) => {
    if (!formData.assignedTo.includes(manager._id)) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, manager._id]
      }))
    }
    setManagerSearch('')
  }

  const removeManagerFromAssignment = (managerId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(id => id !== managerId)
    }))
  }

  const getAssignedManagers = () => {
    return managers.filter(manager => formData.assignedTo.includes(manager._id))
  }

  const getFilteredManagers = () => {
    return managers.filter(manager => 
      manager.email.toLowerCase().includes(managerSearch.toLowerCase()) ||
      manager.name.toLowerCase().includes(managerSearch.toLowerCase())
    )
  }

  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: '',
      dueDate: null,
      assignedTo: [],
      attachments: [],
      totalBudget: '',
      managerSalary: ''
    })
    setAttachmentInputs([{ id: Date.now(), value: '' }])
    setManagerSearch('')
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validate required fields
      if (!formData.title || !formData.priority || !formData.dueDate || formData.assignedTo.length === 0 || !formData.totalBudget) {
        toast.error("Please fill in all required fields")
        return
      }

      // Validate budget values
      if (parseFloat(formData.totalBudget) <= 0) {
        toast.error("Total budget must be greater than 0")
        return
      }

      if (formData.managerSalary && parseFloat(formData.managerSalary) >= parseFloat(formData.totalBudget)) {
        toast.error("Manager salary cannot be greater than or equal to total budget")
        return
      }      const projectData = {
        ...formData,
        attachments: formData.attachments.filter(att => att.trim() !== ''),
        totalBudget: parseFloat(formData.totalBudget),
        managerSalary: formData.managerSalary ? parseFloat(formData.managerSalary) : 0
      }

      await projectAPI.createProject(projectData)
      toast.success("Project has been created successfully!")
      clearForm()
      setIsDrawerOpen(false)
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error("Failed to create project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SupervisorLayout>
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Create Project</h1>
            
            <div className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="E-commerce Platform Development"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe project objectives and scope"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        )}
                      >
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
              </div>

              {/* Budget Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBudget">Total Budget * ($)</Label>
                  <div className="relative">
                    <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="totalBudget"
                      type="number"
                      placeholder="50000"
                      value={formData.totalBudget}
                      onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerSalary">Manager Salary ($)</Label>
                  <div className="relative">
                    <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="managerSalary"
                      type="number"
                      placeholder="5000"
                      value={formData.managerSalary}
                      onChange={(e) => handleInputChange('managerSalary', e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Assign To Managers */}
              <div className="space-y-2">
                <Label>Assign To Manager *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IconUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search managers by email or name..."
                        value={managerSearch}
                        onChange={(e) => setManagerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      onClick={fetchManagers} 
                      variant="outline" 
                      size="icon"
                      title="Refresh Managers"
                    >
                      <IconUsers className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Search Results */}
                  {managerSearch && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {getFilteredManagers().map(manager => (
                        <button
                          key={manager._id}
                          className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between w-full text-left"
                          onClick={() => addManagerToAssignment(manager)}
                          onKeyDown={(e) => e.key === 'Enter' && addManagerToAssignment(manager)}
                        >
                          <div>
                            <p className="font-medium">{manager.name}</p>
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                          </div>
                          <IconPlus className="h-4 w-4" />
                        </button>
                      ))}
                      {getFilteredManagers().length === 0 && (
                        <p className="p-2 text-muted-foreground">No managers found</p>
                      )}
                    </div>
                  )}

                  {/* Selected Managers */}
                  <div className="flex flex-wrap gap-2">
                    {getAssignedManagers().map(manager => (
                      <Badge key={manager._id} variant="secondary" className="flex items-center gap-1">
                        {manager.name}
                        <IconX 
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeManagerFromAssignment(manager._id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Attachments */}
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
                    <Button className="flex-1">Create Project</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Confirm Project Creation</DrawerTitle>
                      <DrawerDescription>
                        Do you want to create this project?
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Yes, Create Project"}
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
    </SupervisorLayout>
  )
}

export default CreateProject