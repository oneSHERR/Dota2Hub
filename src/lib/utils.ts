import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getAttrColor(attr: string): string {
  switch (attr) {
    case 'str': return '#EC3D06';
    case 'agi': return '#26E030';
    case 'int': return '#00B4F0';
    default: return '#ccc';
  }
}

export function getAttrLabel(attr: string): string {
  switch (attr) {
    case 'str': return 'Сила';
    case 'agi': return 'Ловкость';
    case 'int': return 'Интеллект';
    case 'all': return 'Универсал';
    default: return attr;
  }
}
