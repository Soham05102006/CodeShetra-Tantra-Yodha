import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveApplication from "../models/leaveApplication.js";
import Payslip from "../models/Payslip.js";
import { DEPARTMENTS } from "../constants/department.js";


//Get dashboard for employee and Admin
//GET /api/dashboard
export const getDashboard = async (req, res) => {
    try {
        const session = req.session;
        if (session.role === "ADMIN") {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(24, 0, 0, 0);

            const [totalEmployees, todayLeaves, todayAttendance, pendingLeaves] = await Promise.all([
                Employee.countDocuments({ isDeleted: { $ne: true } }),
                LeaveApplication.countDocuments({
                    date: {
                        $gte: todayStart,
                        $lt: todayEnd,
                    }
                }),
                Attendance.countDocuments({
                    date: {
                        $gte: todayStart,
                        $lt: todayEnd,
                    }
                }),
                LeaveApplication.countDocuments({ status: "PENDING" })
            ]);

            return res.json({
                role: "ADMIN",
                totalEmployees,
                totalDepartments: DEPARTMENTS.length,
                todayLeaves,
                todayAttendance,
                pendingLeaves
            });
        }

        const employee = await Employee.findOne({ userId: session.userId }).lean();
        if (!employee) return res.status(404).json({ error: "EMPLOYEE NOT FOUND" });

        const today = new Date();
        const [currentMonthAttendance, pendingLeaves, latestPayslip] = await Promise.all([
            Attendance.findOne({
                employeeId: employee._id,
                date: {
                    $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                    $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
                }
            }),
            LeaveApplication.countDocuments({
                employeeId: employee._id,
                status: "PENDING",
            }),
            Payslip.findOne({ employeeId: employee._id }).sort({ createdAt: -1 }).lean(),
        ]);

        return res.json({
            role: "EMPLOYEE",
            employee: {
                ...employee,
                id: employee._id.toString(),
            },
            currentMonthAttendance,
            lastPayslip: latestPayslip ? { ...latestPayslip, id: latestPayslip._id.toString() } : null,
            pendingLeaves
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch dashboard data." });
    }
};