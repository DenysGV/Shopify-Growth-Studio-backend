import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const lectureCompletedSchema = new Schema({
   lectureId: { type: Number, required: true },
   title: { type: String, required: true }
});

const userSchema = new Schema(
   {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
      phone: { type: String },
      tgUserName: { type: String },
      totalTimeSpent: { type: Number, default: 0 },
      lecturesCompleted: {
         lessons: {
            type: [lectureCompletedSchema],
            default: [],
         },
         homeworks: {
            type: [lectureCompletedSchema],
            default: [],
         },
      },
   },
   { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User