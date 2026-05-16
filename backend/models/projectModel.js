const mongoose = require('mongoose');

const budgetHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    action: { type: String, required: true },
    previousBudget: { type: Number },
    newBudget: { type: Number },
    description: { type: String }
});

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'in-progress', 'completed'] },
    priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
    dueDate: { type: Date, required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    attachments: [{ type: String }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], 
    totalBudget: { type: Number, required: true, default: 0 }, 
    currentBudget: { type: Number, default: 0 }, 
    managerSalary: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    budgetHistory: [budgetHistorySchema]
}, 
{ timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
