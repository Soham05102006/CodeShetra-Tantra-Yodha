import React, { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
const GeneratePayslip = ({ employee = [], onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return (
        <button
        onClick={()=>setIsOpen(true)} 
        className='btn-primary flex items-center gap-2'>
            <Plus className="w-4 h-4"/> Generate Payslip

        </button>
    )

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (typeof onSuccess === 'function') {
            onSuccess()
        }
    }

  return (
    <div className='fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex 
                     items-center justify-center p-4 overflow-y-auto' onClick={
                      ()=>setIsOpen(false) }>
              <div className='card max-w-lg w-full p-6 animate-slide-up' onClick={e => e.stopPropagation()}>
                              <div className="flex justify-between items-center mb-6">
                                <h3 className='font-bold text-lg text-slate-900'>Generate Monthly Payslip</h3>
                               <button
                               onClick={()=>setIsOpen(false)}
                               className='text-slate-400 hover:text-slate-600 p-1'>
                                   <X size={20}/>
                               </button> 
                              </div>
                              <form action="" onSubmit={handleSubmit} className='space-y-4'>
                                {/** Select Employee */}
                                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                                        Employee
                                    </label>
                                    <select name='employeeId' required>
                                        {employee.map((e)=> (
                                            <option key={e.id} value={e.id}>
                                                {e.firstName} {e.lastName} ({e.position})
                                            </option>
                                        ))}
                                    </select>
                                {/**Select Month & year */}
                                        <div className='grid grid-cols-2 gap-4'>
                                                   <div>
                                                           <label className='block text-sm font-medium text-slate-700 mb-2'>
                                                                  Month
                                                           </label>
                                                           <select name="month" >
                                                            {Array.from({length: 12}, (_, i)=> i + 1).map(
                                                                (m)=>(
                                                                    <option key={m}  value={m}>
                                                                          {m}
                                                                    </option>
                                                                    
                                                                )
                                                            )}
                                                           </select>
                                                   </div>
                                                     <div>
                                                           <label className='block text-sm font-medium text-slate-700 mb-2'>
                                                                  Month
                                                           </label>
                                                           <input type="number" name='year' defaultValue={new Date().getFullYear()}  />
                                                   </div>
                                        </div>
                                {/**Basic Salary */}
                                               <div>
                                                 <label className='block text-sm font-medium
                                                  text-slate-700 mb-2'>
                                                    Basic Salary
                                                </label>
                                                <input type="number" name='basic salary' required
                                                placeholder='50000'  />
                                         </div>
                                {/**Allowences & Deduction */}
                                         <div className='grid grid-cols-2 gap-4'>
                                               <div>
                                                 <label className='block text-sm font-medium
                                                  text-slate-700 mb-2'>
                                                    Allowences
                                                </label>
                                                <input type="number" name='allowences' 
                                           defaultValue="0"  />
                                         </div>
                                          <div>
                                                 <label className='block text-sm font-medium
                                                  text-slate-700 mb-2'>
                                                    Deductions
                                                </label>
                                                <input type="number" name='deductions' 
                                           defaultValue="0"  />
                                         </div>
                                         </div>
                                {/**Button */}
                                       <div className='flex justify-end gap-3 pt-2'>
                                        <button onClick={()=> setIsOpen(false)} type='button' className='btn-secondary'>
                                            Cancel
                                        </button>
                                        <button 
                                        disabled={loading}
                                        type='submit' className='btn-primary flex items-center'>
                                            {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin'/>}
                                            Generate
                                        </button>

                                       </div>

                              </form>
              </div>

    </div>
  )
}

export default GeneratePayslip