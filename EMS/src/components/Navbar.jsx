import React from 'react'
import { Search, Bell, User } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" size={18} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors duration-200 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors duration-200">
          <div className="w-8 h-8 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
            SG
          </div>
          <span className="text-sm font-medium text-slate-700">Soham G.</span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
