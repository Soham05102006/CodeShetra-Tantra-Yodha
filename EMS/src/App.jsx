import {Toaster} from 'react-hot-toast'
import {Routes,Route, Navigate} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Leave from './pages/Leave'
import Payslip from './pages/Payslip'
import Settings from './pages/Settings'
import Logout from './pages/Logout'
import Loginlanding from './pages/Loginlanding'
import Printpayslips from './pages/Printpayslips'
import Layout from './pages/Layout'
import LoginForm from './components/LoginForm'

const App = () => {
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path="/" element={<Loginlanding/>}/>
        <Route path="/login" element={<Loginlanding />} />
  <Route
    path="/login/admin"
    element={
      <LoginForm
        role="admin"
        title="Admin portal"
        subtitle="Sign in to manage organization"
      />
    }
  />
  <Route
    path="/login/employee"
    element={
      <LoginForm
        role="employee"
        title="Employee portal"
        subtitle="Sign in to manage your account"
      />
    }
  />
      <Route element={<Layout/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/employees" element={<Employees/>}/>
        <Route path="/attendance" element={<Attendance/>}/>
        <Route path="/leave" element={<Leave/>}/>
        <Route path="/payslip" element={<Payslip/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/logout" element={<Logout/>}/>
      </Route>
       <Route path="/print/payslips/:id" element={<Printpayslips/>}/>
       <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
    
    </>
  )
}

export default App