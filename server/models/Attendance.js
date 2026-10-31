import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employeeId :{type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true},
    date : {type: Date, required : true},
    checkIn : {type: Date, default: null},
    checkOut : {type: Date, default: null},
    status : {type: String , enum: ["PRESENT", "ABSENT", "LATE"],
    default : "PRESENT"},
    workingHours : {type : Number, default: null },
    dayType : { type : String, enum: ["FULL DAY", "THREE QUATER DAY", "HALF DAY", "SHORT DAY", null], default: null}
}, {timestamps: true})

attendanceSchema.index({employeeId : 1, date : 1}, {unique : 1})

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema)

export default Attendance;