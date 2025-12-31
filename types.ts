
export enum UserRole {
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
}

export interface JobPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface VendorJob {
  id: string;
  userId: string;
  vendorName: string;
  companyName: string;
  picName: string;
  picPhone: string;
  jobType: string;
  building: string;
  floor: string;
  room: string;
  description: string;
  startTime: string;
  endTime: string;
  photos: JobPhoto[];
  createdAt: string;
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  companyName?: string;
  jobType?: string;
  search?: string;
}
