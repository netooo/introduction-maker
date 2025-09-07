import { Item } from './item';

export interface Project {
  id: string;
  templateId: string;
  items: Item[];
  createdAt: Date;
  lastAccessedAt: Date;
}