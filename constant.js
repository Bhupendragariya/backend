export const USER_ROLE_ENUM = ["Admin", "HR", "Employee"];

export const WEEKDAYS_ENUM = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MONTHNAMES_ENUM = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const PERIOD_ENUM = ['Monthly', 'Quarterly', 'Annually', 'Biannually']

export const NORMAL_STATUS_ENUM = ["Pending", "Approved", "Rejected"]


//----attendance-----------
export const ATTENDANCE_STATUS_ENUM = ['Present', 'Absent', 'On Leave', 'WFH']

export const LOCATION_TYPE_ENUM = ['Online', 'Offline', 'N/A'];

export const LEAVETYPE_TYPE_ENUM = ['Paid', 'Unpaid']


//----emp-----------
export const EMP_STATUS_ENUM = ['Active', 'Inactive'];

export const GENDER_ENUM = ["Male", "Female", "Other", "Prefer not to say"]

export const EMP_DOC_TYPE_ENUM = [
  'empIdProof',
  'empPhoto',
  'emp10PassCert',
  'emp12PassCert',
  'empGradCert',
  'empExpCert',
  'empResume',
  'empOfferLetter',
  'empOtherDoc'
];

export const EMP_DOC_STATUS_ENUM = ['Approved', 'Rejected', 'Pending Update', 'Pending Delete'];

export const EMP_DOC_ALLOWED_FORMATS_ENUM = ['jpg', 'jpeg', 'png', 'pdf']

export const EMP_DOC_ALLOWED_MIMETYPE_ENUM = ['image/jpeg', 'image/png', 'application/pdf']



//--------general--------
export const APPEARANCE_ENUM = ['Bright', 'Dark'];

//--------feedback--------
export const FEEDBACK_STATUS_ENUM = ["Read", "Unread"]