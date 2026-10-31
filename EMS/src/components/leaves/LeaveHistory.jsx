import { Check, Loader2, X } from 'lucide-react'
import React, { useState } from 'react'
import {format} from 'date-fns'


const LeaveHistory = ({leaves,isAdmin, onUpdate}) => {
    const [proccessing, setProccessing] = useState(null)

    const hanndleStatusUpdate = async (id, status)=>{
        setProccessing(id)
    }
  return (
        <div className='card overflow-hidden'>
              <div className='overflow-x-auto'>
                     <table className='table-modern'>
                         <thead>
                           <tr>
                            {isAdmin && <th>Employee</th>}
                            <th className='px-6 py-4'>Type</th>
                             <th className='px-6 py-4'>Dates</th>
                              <th className='px-6 py-4'>Reason</th>
                               <th className='px-6 py-4'>Status</th>
                               {isAdmin && <th className='px-6 py-4 text-center'>Action</th>}
                           </tr>
                         </thead>
                         <tbody>
                             {leaves.length === 0 ? (
                              <tr>
                                <td colSpan={isAdmin ? 6 : 4} className='text-center
                                 text-slate-400 py-12 '>
                                  No Leave applicztion found
                                </td>
                              </tr>
                             ) : (
                                   leaves.map(leave => {
                                           
                                           return(
                                            <tr key={leave._id || leave._id}>
                                                {isAdmin ?? (
                                                <td className=' text-slate-900 '>
                                                    {leave.employee?.firstName}
                                                    {leave.employee?.lastName}
                                                   </td>)}
                                                   <td>
                                                    <span className='bagde text-slate-600 bg-slate-100'>{leave.type}</span>
                                                </td>
        
                                                    
        
                                                   <td className='text-xs text-slate-500'>
                                                    {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                                                   </td>
        
                                                   <td className='max-w-xs truncate text-slate-500' title={leave.reason}>
                                                      {leave.reason}
                                                   </td>
                                                   <td className='px-6 py-4 '>
                                                    <span className={`badge ${leave.status === "APPROVED" ? "badge-success" : 
                                                         leave.status === "REJECTED" ? 
                                                        "badge-danger" : "badge-warning"}`}>{leave.status}</span>
                                                   </td>
                                                   {isAdmin &&(
                                                   <td>
                                                    {leave.status === "PENDING" &&
                                                      <div className='flex justify-center gap-2'>
                                                          <button onClick={()=> hanndleStatusUpdate(leave._id || leave.id, "APPROVED")} 
                                                          className='p-1.5 rounded-md bg-emerald-50 text-emerald-600
                                                          hover:bg-emerald-100 transition-colors'>
                                                            {proccessing === (leave._id || leave._id) ? <Loader2 className='w-4
                                                             h-4 animate-spin'/> : <Check className='w-4 h-4 '/> }
                                                          </button>

                                                           <button onClick={()=> hanndleStatusUpdate(leave._id || leave.id, "REJECTED")}
                                                           disabled={!!proccessing}
                                                            className='p-1.5 rounded-md bg-emerald-50 text-emerald-600
                                                          hover:bg-emerald-100 transition-colors'>
                                                            {proccessing === (leave._id || leave._id) ? <Loader2 
                                                            className='w-4 h-4 animate-spin'/> : <X className='w-4 h-4 '/> }
                                                          </button>
                                                     </div>}
                                                      {leave.status}
                                                    
                                                   </td>)}
                                            </tr>
                                           )
                                 })
                             )}
                         </tbody>
                     </table>
              </div>
            </div>

  )
}

export default LeaveHistory