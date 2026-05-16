const { text } = require('express');
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String},
    status: { type: String, default: 'pending', enum: ['pending', 'in-progress', 'completed'] },
    priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
    dueDate: { type: Date, required: true },    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },    attachments: [{ type: String }], 
    todoChecklist: [todoSchema],
    taskBudget: { type: Number, default: 0 },
    memberSalary: { type: Number, default: 0 },
    memberSalaries: { type: Map, of: Number, default: {} }, 
    progress: { type: Number, default: 0 }
},

{ timestamps: true });



module.exports = mongoose.model('Task', taskSchema);
