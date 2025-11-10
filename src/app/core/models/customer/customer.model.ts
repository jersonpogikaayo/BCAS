import { Site } from "../site/site.model";

export interface CustomerType {
    id: number;
    isArchived: boolean;
    name: string;
    value: number;
}

export interface Customer {
    coverLevelId: null;
    contactId: null;
    siteId: null;
    customerTypeId: number;
    customerType: CustomerType;
    name: string;
    contract: boolean;
    notes: string | null;
    parentId: number | null;
    parent: Customer | null;
    sites: Site[];
    contacts: Contact[] | null;
    rates: Rate[] | null;
    coverLevels: CoverLevel[] | null;
    lastModifiedUser: string | null;
    lastModifiedDate: string | null;
    dateCreated: string | null;
    id: number;
    isArchived: boolean;
}


export interface Contact {
    id: number;
    isArchived: boolean;
    lastModifiedUser: string;
    lastModifiedDate: string; // ISO date format
    dateCreated: string; // ISO date format
    firstName: string;
    surname: string;
    phone: string;
    extension: string;
    mobile: string;
    email: string;
    notes: string;
    mainContact: boolean;
    departmentId: number;
    [key: string]: any;
}

  
export interface Rate {
    id: number;
    isArchived: boolean;
    value: number;
    name: string;
    hourlyRate: number;
    primary: boolean;
}

export interface CoverLevel {
    id: number;
    isArchived: boolean;
    value: number;
    name: string;
    primary: boolean;
    notes: string;
}