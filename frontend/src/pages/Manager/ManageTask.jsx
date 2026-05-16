import React from 'react'
import { ManagerLayout } from "@/components/Manager-layout"

const ManageTask = () => {
  return (
    <ManagerLayout>
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manage Tasks</h1>
            {/* Task management content */}
            <p className="text-muted-foreground">Task management interface will be implemented here</p>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}

export default ManageTask