import React from 'react'
import { CalendarIcon, FileTextIcon, UserIcon, Building2Icon } from 'lucide-react'



const AdminDashboard = ({data}) => {
    const admin = data.admin;
      const cards = [
        {
            icon: UserIcon,
            value: data.totalEmployees ,
            title: "Total Employees",
            subtitle: "Active Workers",
        },
        {
            icon: Building2Icon,
            value: data.totalDepartments ,
            title: "Departments",
            subtitle: "All time",
        },
        {
            icon: CalendarIcon,
            value: data.todayAttendance ,
            title: "Today's Attendance",
            subtitle: "This Month",
        },
        {
            icon: FileTextIcon,
            value: data.pendingLeaves ,
            title: "Pending Leaves",
            subtitle: "This Month",
        },
        

    ]   

  return (
    <div className=" animate-fade-in ">
        <div className="page-header ">
              <h1 className="page-title">Dashboard {admin?.FirstName}!</h1>
              <p className="subtitle"> Welcome back, Admin! Here's your overview.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                     {cards.map((s) => (
                        <div key={s.title} className="card card-hover p-5 sm:p-6 relative overflow-hidden group flex 
                        items-center justify-between">
                            <div>
                                <div className='absolute left-0 top-0 bottom-0 w-1 
                                rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/70'/>
                                <p className='text-sm font-medium text-slate-700'>{s.title}</p>
                                <p className='text-2xl font-bold text-slate-900 mt-1' >{s.value}</p>
                            </div>
                            <s.icon className="size-10 p-2.5 rounded-lg bg-slate-100
                            text-slate-600 group-hover:bg-indigo-50 
                            group-hover:text-indigo-600 transition-colors duration-200" />

                        </div>
                     ))}
                </div>
        </div>
    )
}

export default AdminDashboard