import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import PrivateRoute from './routes/PrivateRoute';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import MyProjects from './pages/Manager/MyProjects';
import ManageUser from './pages/Manager/ManageUser';
import ManageTasks from './pages/Manager/ManageTasks';
import UpdateTask from './pages/Manager/updateTask';
import CreateTask from './pages/Manager/CreateTask';
import TeamMembers from './pages/Manager/TeamMembers';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import TaskDetails from './pages/User/TaskDetails';
import MemberDashboard from './pages/Member/MemberDashboard';
import MemberTasks from './pages/Member/MemberTasks';
import MemberTaskDetails from './pages/Member/MemberTaskDetails';
import CreateProject from './pages/Supervisor/CreateProject';
import UpdateProject from './pages/Supervisor/UpdateProject';
import SupervisorDashboard from './pages/Supervisor/SupervisorDashboard';
import ManageManagers from './pages/Supervisor/ManageManagers';
import ManageProjects from './pages/Supervisor/ManageProjects';
import ManageTeamMembers from './pages/Supervisor/ManageTeamMembers';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp />} />

          {/*Supervisor routes */}
          <Route element={<PrivateRoute allowedRoles={['supervisor']} />}>
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/managers" element={<ManageManagers />} />
            <Route path="/supervisor/projects" element={<ManageProjects />} />
            <Route path="/supervisor/projects/update/:id" element={<UpdateProject />} />
            <Route path="/supervisor/create-project" element={<CreateProject />} />
            <Route path="/supervisor/team-members" element={<ManageTeamMembers />} />
          </Route>

          {/* Manager routes */}
          <Route element={<PrivateRoute allowedRoles={['manager']} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/my-projects" element={<MyProjects />} />
            <Route path="/manager/users" element={<ManageUser />} />
            <Route path="/manager/tasks" element={<ManageTasks />} />
            <Route path="/manager/tasks/create" element={<CreateTask />} />
            <Route path="/manager/tasks/update/:id" element={<UpdateTask />} />
            <Route path="/manager/team-members" element={<TeamMembers />} />
            <Route path="/manager/create-task" element={<CreateTask />} />
          </Route>

          {/* Member routes */}
          <Route element={<PrivateRoute allowedRoles={['member']} />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/tasks" element={<MemberTasks />} />
            <Route path="/member/task-details/:id" element={<MemberTaskDetails />} />
          </Route>

         {/* Legacy user routes - kept for backward compatibility */}
         <Route element={<PrivateRoute allowedRoles={['member']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/my-tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<TaskDetails />} />
          </Route>

        
          <Route 
            path="/dashboard" 
            element={<PrivateRoute allowedRoles={['Manager', 'member']} />}
          />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App