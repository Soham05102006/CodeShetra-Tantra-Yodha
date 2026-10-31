import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
      <Sidebar />

      {/* lg:pl-64 shifts the entire block right by 256px on desktop so nothing gets covered */}
      <main className="w-full pt-16 lg:pt-0 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
    )
}

export default Layout