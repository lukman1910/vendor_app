
import { VendorJob } from './types';

export const mockJobs: VendorJob[] = [
  {
    id: '1',
    userId: 'u1',
    vendorName: 'Budi Santoso',
    companyName: 'PT. Sejuk Selalu',
    picName: 'Budi',
    picPhone: '08123456789',
    jobType: 'HVAC/AC',
    building: 'Gedung A (Utama)',
    floor: 'Lantai 2',
    room: 'Ruang Rapat Sekretariat',
    description: 'Pembersihan filter dan penambahan freon unit AC Sharp 2PK.',
    startTime: '2024-05-15T09:00',
    endTime: '2024-05-15T11:30',
    photos: [
      { id: 'p1', url: 'https://picsum.photos/seed/ac1/800/600' },
      { id: 'p2', url: 'https://picsum.photos/seed/ac2/800/600' }
    ],
    createdAt: '2024-05-15T11:45:00Z'
  },
  {
    id: '2',
    userId: 'u2',
    vendorName: 'Indra Jaya',
    companyName: 'CV. Terang Benderang',
    picName: 'Indra',
    picPhone: '08199887766',
    jobType: 'Listrik (Electrical)',
    building: 'Gedung B',
    floor: 'Lantai 1',
    room: 'Lobby Utama',
    description: 'Penggantian lampu downlight LED 12W yang mati sebanyak 5 titik.',
    startTime: '2024-05-14T13:00',
    endTime: '2024-05-14T14:30',
    photos: [
      { id: 'p3', url: 'https://picsum.photos/seed/light1/800/600' }
    ],
    createdAt: '2024-05-14T15:00:00Z'
  }
];
