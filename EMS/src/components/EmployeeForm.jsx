import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { POSITIONS } from '../assets/assets';
import { DEPARTMENT } from '../assets/assets';



const EmployeeForm = ({initialData, onSuccess, onCancel}) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;
    const handleSubmit = async (e) =>{
      e.preventDefault()
    }
  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-3xl animate-fade-in'>
           
            {/** Personal Information */}
           <div className='card p-5 sm:p-6'>
                    <h3 className='font-medium mb-6 pb-4 border-b 
                    border-slate-100'>Personal Information</h3>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
                             <div>
                                <label className='mb-2 block'>First Name</label>
                                <input name='firstName' required defaultValue={initialData?.firstName} />
                             </div>
                             <div>
                                <label className='mb-2 block'>Last Name</label>
                                <input name='lastName' required defaultValue={initialData?.lastName} />
                             </div>
                             <div>
                                <label className='mb-2 block'>Phone Name</label>
                                <input name='phone' required defaultValue={initialData?.phone} />
                             </div>
                             <div>
                                <label className='mb-2 block'>Join Date</label>
                                <input type='date' name='joinDate' required defaultValue={initialData?.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : ""} />
                             </div>
                             <div className='sm:col-span-2'>
                                <label className='mb-2 block'>Bio (Optional)</label>
                                <textarea name='bio'  defaultValue={initialData?.bio} 
                                rows={3} className='resize-none' placeholder='Brief Description...'/>
                             </div>

                    </div>

           </div>
           {/** Employement Details */}
           <div className='card p-5 '>
            <h3 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b
             border-slate-100'>
               Employement Deatils
            </h3>
                   <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
                         <div>
                               <label className='block mb-2'>Department</label>
                               <select name="department" defaultValue={initialData?.department || ""}>
                                     <option value="" disabled>{initialData?.department ? initialData.department : 'Select department'}</option>
                                    {DEPARTMENT.map((department) => (
                                        <option key={department} value={department}>{department}</option>
                                        ))}
{/**<option value={initialData?.department || ""}>{initialData?.department || "Select department"}</option>*/}
                               </select>
                         </div>
                          <div>
                                <label className='mb-2 block'>Position</label>
                                <select name='position' required defaultValue={initialData?.position || ""}>
                                    <option value="" disabled>{initialData?.position ? initialData.position : 'Select position'}</option>
                                    {POSITIONS.map((position) => (
                                        <option key={position} value={position}>{position}</option>
                                    ))}
                                </select>
                          </div>
                          <div>
                                <label className='mb-2 block'>Basic Salary</label>
                                <input type='number' name='basicSalary' required min="0" step="0.01" defaultValue={initialData?.basicSalary || 0 } />
                          </div>
                          <div>
                                <label className='mb-2 block'>Allowances</label>
                                <input name='allowances' min="0" step="0.01" required
                                 defaultValue={initialData?.allowances || 0} />
                          </div>
                           <div>
                                <label className='mb-2 block'>Deductions</label>
                                <input name='deductions' min="0" step="0.01" required
                                 defaultValue={initialData?.deductions || 0} />
                          </div>
                                {isEditMode && (
                                 <div>
                                       <div>
                                     <label className='mb-2 block'>Status</label>
                                     <select name='employementStatus'
                                      defaultValue={initialData?.employementStatus} >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                      </select>
                                      </div>
                                 </div>
                                )}
                   </div>

           </div>
             {/** Account setup */}
                  <div className='card p-5 sm:p-6'>
                    <h3 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b
                    border-slate-100'>Account Setup</h3>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
                             <div className='sm:col-span-2'>
                                <label className='mb-2 block'>Work Email</label>
                                <input type='email' name='email' required defaultValue={initialData?.email} />
                             </div>
                             {!isEditMode && (
                              <div>
                                    <label className='block mb-2'>Temporary Password</label>
                                    <input type="password" name='password' required />
                              </div>
                             )}
                              {isEditMode && (
                              <div>
                                    <label className='block mb-2'>Change Password(Optional)</label>
                                    <input type="password" name='password' placeholder='Leave Blank to keep current'/>
                              </div>
                             )}
                             <div>
                                    <label className='block mb-2'>System Role</label>
                                    
                                    <select name="role" defaultValue={initialData?.role || "EMPLOYEE"}>
                                         <option value="EMPLOYEE">Employee</option>
                                         <option value="ADMIN">Admin</option>
                                    </select>
                              </div>
                    </div>
           </div>
            
               {/**Buttons */}
               <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2'>
                         <button type='button' className='btn-secondary' onClick={()=>(onCancel? onCancel() : navigate(-1))}>
                                    Cancel
                         </button>
                        <button type='submit' disabled={loading} className='btn-primary flex items-center justify-center'>
                                   {loading && <Loader2Icon className="h-4 w-4 mr-2 animate-spin"/>}
                                   {isEditMode ? "Update Employee" : "Create Employee"}
                         </button>
               </div>
    </form>
  )
}

export default EmployeeForm