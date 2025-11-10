import { Contact } from "../customer/customer.model";
import { Equipment } from "../equipment/equipment.model";
import { Site } from "../site/site.model";

export interface Department {
  id: number;
  name: string;
  contacts?: Contact;
  equipment?: Equipment;
  siteId: number;
  site?: Site;
  notes?: string | null;
  customerId?: number | null;
  customer?: any;
  lastModifiedUser?: any;
  lastModifiedDate?: Date | null;
  dateCreated?: Date | null;
  isArchived: boolean;
  [key: string]: any;
}