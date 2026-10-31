import Employee from "../models/Employee.js"
import LeaveApplication from "../models/leaveApplication.js";
import inggest from "../inngest/index.js";

//Create leave
//POST /api/leaves

export const createLeave = async (req , res)=>{
       try {
        const session = req.session;
        const employee = await Employee.findOne({userId: session.userId})
        if(!employee) return res.status(404).json({ error : "EMployee Not Found"});
        if(employee.isDeleted){
           res.status(403).json({error : "Your Account is deactivated. You cannot apply for leave.",})
        }

        const { type, startDate, endDate, reason} = req.body
        if(!type || !startDate || !endDate || !reason){
            return res.status(400).json({error : "Missing Failed"});
        }

        const today =new Date();
        today.setHours(0,0,0,0)
        if(new Date(startDate) <= today || new Date(endDate) <= today){
            req.status(400).json({error: "Leave date must be in future."});
        }
         if(new Date(endDate) <new Date(startDate) ){
            req.status(400).json({error: "Leave date must be in future."});
        }
                     
                    const leave = await LeaveApplication.create({
                            employeeId: employee._id,
                            type,
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                            reason,
                    status: "PENDING",
                  });

            await inggest.send({
                name: "leave/pending",
                data: {
                    LeaveApplicationId: leave._id,
                    
                }
            });

            return res.json({success : true, data : leave});

       } catch (error) {
             return res.status(500).json({error : " Failed"});
       }
}

//Get leave
//GET /api/leaves

export const getLeaves = async (req , res)=>{
          try {
            const session = req.session;
            const isAdmin = session.role == "ADMIN";
            if(isAdmin){
                const status = req.query.status;
                const where = status ? {status} : {};
                const leaves = await LeaveApplication.find(where).populate("employeeId").sort({createdAt : -1});
                const data = leaves.map((l)=>{
                    const obj = l.toObject();
                    return {
                        ...obj,
                        id: obj._id.toString(),
                        employee: obj.employeeId,
                        employeeId: obj.employeeId?._id?.toString(),

                    }
                })
                return res.json({data})

            } else {
                const employee = await Employee.findOne({
                    userId: session.userId,    
                }).lean();
                if (!employee) return res.status(404).json({error: "NOT FOUND"}) 
                    const leaves = await LeaveApplication.find({
                     employeeId : employee._id
                    }).sort({createdAt: -1});
                    return res.json({
                        data: leaves,
                        employee: {...employee, id: employee._id.toString()}
                    })
            }

          } catch (error) {
             return res.status(500).json({error : " Failed"});
          }
}

//Update leave status
//GET /api/leaves/:id

export const updateLeaveStatus = async (req , res)=>{
          try{
            const {status} = req.body;
            if(!["APPROVED", "REJECTED","PENDING"].includes(status)){
                return res.status(400).json({ error: "Invalid Status" });

            }
            const leave = await LeaveApplication.findByIdAndUpdate(req.params.id, {status}, {returnDocument: "after"})
            return res.json({success: true, data : leave})
          } catch(error){
              return res.status(500).json({error: "FAILED"});
          }
}