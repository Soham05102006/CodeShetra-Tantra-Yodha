import React, { useState } from 'react'
import {format} from 'date-fns'
import { Download } from 'lucide-react'

const PayslipList = ({payslip, isAdmin}) => {
  return (
    <div className='card overflow-hidden'>
              <div className='overflow-x-auto'>
                     <table className='table-modern'>
                         <thead>
                           <tr>
                            {isAdmin && <th>Employee</th>}
                            <th className='px-6 py-4'>Period</th>
                             <th className='px-6 py-4'>Basic Salary</th>
                              <th className='px-6 py-4'>Net Salary</th>
                               <th className='px-6 py-4 text-center'>Action</th>
                              
                           </tr>
                         </thead>
                         <tbody>
                             {payslip.length === 0 ? (
                              <tr>
                                <td colSpan={isAdmin ? 5 : 4} className='text-center
                                 text-slate-400 py-12 '>
                                  No Payslips found
                                </td>
                              </tr>
                             ) : (
                                   payslip.map(item => {
                                            
                                           return(
                                            <tr key={item._id || item.id}>
                                                {isAdmin && (
                                                <td className=' text-slate-900 '>
                                                    {item.employee?.firstName} {item.employee?.lastName}
                                                   </td>)}
                                                   <td className='text-slate-500'>
                                                    {format(new Date(item.year, item.month - 1), "MMMM yyyy")}
                                                </td>

                                                   <td className='max-w-xs truncate text-slate-500' title={item.basicSalary}>
                                                      ${item.basicSalary?.toLocaleString()}
                                                   </td>
                                                   <td className='max-w-xs truncate text-slate-800' title={item.netSalary}>
                                                      ${item.netSalary?.toLocaleString()}
                                                   </td>
                                                   <td className='text-center'>
                                                      <button onClick={()=>window.open(`/print/payslips/${item._id || item.id}`)}
                                                       className='inline-flex items-center py-3 px-1.5 text-xs font-medium rounded text-blue-600
                                                      bg-blue-50 hover:bg-blue-100 transition-colors ring-1 ring-blue-600/10'>
                                                        <Download className='w-3 h-3 mr-1.5'/> Download
                                                      </button>
                                                   </td>
                                                  
                                                   
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

export default PayslipList