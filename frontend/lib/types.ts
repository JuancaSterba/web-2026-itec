export interface Student {
  id: number
  name: string
  dni: string
  email: string
  phone: string
  enrollmentDate: string
  status: "ACTIVE" | "INACTIVE"
  academicStatus: "REGULAR" | "IRREGULAR"
}

export interface Teacher {
  id: number
  name: string
  dni: string
  email: string
  phone: string
  subjects: Subject[]
  status: "ACTIVE" | "INACTIVE"
}

export interface Subject {
  id: number
  name: string
  code: string
  credits: number
  correlatives: Subject[]
  teachers: Teacher[]
}

export interface Commission {
  id: number
  name: string
  subject: Subject
  teacher: Teacher
  students: Student[]
  schedule: string
  year: number
  semester: number
}

export interface Attendance {
  id: number
  student: Student
  subject: Subject
  date: string
  present: boolean
  justified: boolean
}

export interface Grade {
  id: number
  student: Student
  subject: Subject
  type: "PARTIAL" | "FINAL"
  value: number
  date: string
  teacher: Teacher
}

export interface Certificate {
  id: number
  student: Student
  type: "ENROLLMENT" | "GRADES" | "GRADUATION"
  issueDate: string
  qrCode: string
  status: "ACTIVE" | "REVOKED"
}
