import mongoose from "mongoose";

const perMeetingConfigSchema = new mongoose.Schema({
  meetingType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingType',
  },
  isSendNotification: {
    type: Boolean,
    default: false
  },
  isVisibleOnDashboard: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });


const meetingConfigSchema = new mongoose.Schema({
  //-------meeting types-----------
  allMeetingTypeConfig: [perMeetingConfigSchema],
}, { timestamps: true });

const MeetingConfig = mongoose.model("MeetingConfig", meetingConfigSchema);

export default MeetingConfig;