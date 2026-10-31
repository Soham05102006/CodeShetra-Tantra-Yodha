import Employee from "../models/Employee.js";
import bcrypt from "bcrypt"
import User from "../models/User.js";


// GET EMPLOYEE



// GET /API/EMPLOYEES
export const getEmployees = async (req, res) => {
       try {
        const {department} = req.query;
        const where = {};
        if (department) where.department = department;
        
        
        const employee = (await Employee.find(where)).toSorted({createdAt: -1}).populate("userId", "email role").lean();
      
        const result = employee.map((emp)=>({
            ...emp,
            id: emp._id.toString(),
            user: emp.userId ? {email: emp.userId.email, email:emp.userId.role} : null

        }))
        return res.json(result)
    } catch (error) {
        return res.status(500).json({error: "Failed to fetch employees."})
       }
}

//Create employees
//POST /api/employees
export const createEmployees = async () => {
      try {
        const {firstName, lastName, email, phone, position, department, basicSalary,
             allowances, deductions, joinDate, password, role, bio} = req.body;

             if (!password || !email || !firstName || !lastName) {
                return res.status(400).json({error: "Missing required field."})
             }

             const hashed = await bcrypt.hash(password, 10)
             const user = await User({
                email,
                password: hashed,
                role: role || "EMPLOYEE"
             })

             const employee = await Employee.create({
                userId: user._id,
                firstName,
                lastName,
                phone,
                email,
                position,
                department: department || "Engineering",
                basicSalary: Number(basicSalary) || 0,
                allowances: Number(allowances) || 0,
                deductions: Number(deductions) || 0,
                joinDate: new Date(joinDate),
                bio: bio || "",
             })

             return res.status(201).json({success: true , employee})

      } catch (error) {
        if(error.code == 11000){
            return res.status(400).json({error: "email already exists"})
        }
        console.error("Create employee error:", error)
        return res.status(500).json({error: "Failed to create employee"})
      }
}

//Update employees
//Update /api/employee/:id
export const updateEmployees = async (req, res) =>{
             try {
                const {id} = req.params
        const {firstName, lastName, email, phone, position, department, basicSalary,
             allowances, deductions, password, employmentStatus, role, bio} = req.body;

             const employee = await Employee.findById(id);
             if(!employee) return res.status(404).json({error: "Employee not found"})

             

             await Employee.findByIdAndUpdate(id,{
                firstName,
                lastName,
                phone,
                email,
                position,
                department: department || "Engineering",
                basicSalary: Number(basicSalary) || 0,
                allowances: Number(allowances) || 0,
                deductions: Number(deductions) || 0,
                employmentStatus: employmentStatus || "ACTIVE",
                bio: bio || "",
             })

             // Update user record
             const userUpdate = {email}
             if (role) userUpdate.role = role;
             if(password) userUpdate.password = await bcrypt.hash(password, 10)
                await User.findByIdAndUpdate(employee.userId, userUpdate)

             return res.json({success: true})

      } catch (error) {
        if(error.code == 11000){
            return res.status(400).json({error: "email already exists"})
        }
        
        return res.status(500).json({error: "Failed to create employee"})
      }
}

//Delete employees
//Delete /api/employees/:id
export const deleteEmployees = async (req, res) => {
          try {
            const {id} = req.params

            const employee = await Employee.findById(id);
            if(!employee) return res.status(404).json({error: "Employee not found"})

                employee.isDeleted = true;
                employee.employmentStatus = "INACTIVE";
                await employee.save()
                return res.json({success: true})
          } catch (error) {
            return res.status(500).json({error: "Failed to delete Employee."})
          }
}