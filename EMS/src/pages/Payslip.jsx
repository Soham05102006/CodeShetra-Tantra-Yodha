import React, { useCallback,useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import {dummyEmployeeData, dummyPayslipData } from '../assets/assets'
import Loading from '../components/Loading'
import PayslipList from '../components/payslips/PayslipList'
import GeneratePayslip from '../components/payslips/GeneratePayslip'


const Payslip = () => {
const [employee, setEmployee] = useState([])
  const [loading, setLoading] = useState(true)
  const [payslip, setPayslip] = useState([])
  const isAdmin = true;

  const fetchPayslip = useCallback( async () =>{
    setPayslip(dummyPayslipData)
           setTimeout(()=>{
                setLoading(false);
           },1000)
     },[])
     useEffect(()=>{
       fetchPayslip()
     },[fetchPayslip])

  useEffect(()=>{
    if(isAdmin) setEmployee(dummyEmployeeData)
  },[isAdmin])

  if(loading) return <Loading/>

  
  return (
    
       <div className='Animate-fade-in'>
          {/** --------------------Header------------------------------ */}
         <div className="flex flex-col sm:flex-row justify-between items-start 
         sm:items-center gap-4 mb-8">
                  <div>
                    <h1 className="page-title">
                      Payslips
                    </h1>
                    <p className="page-subtitle">{isAdmin ? "Generate and Manage Employee Payslips":"Your Payslips History."}</p>
                  </div>
                  {isAdmin &&  (
                  <GeneratePayslip employee={employee} onSuccess={fetchPayslip}/>
                   )}
    </div>

      <PayslipList payslip={payslip} isAdmin={isAdmin}/>
    </div>
  )
}

export default Payslip