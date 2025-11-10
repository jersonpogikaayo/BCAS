export interface Site {
  id: number;
  name: string;
  address1: string;
  address2: string | null;
  address3: string | null;
  email: string | null;
  fax: string | null;
  latitude: number;
  longitude: number;
  organisationCode: string | null;
  organisationId: number;
  status: any | null;
  type: any | null;
  parentName: string | null;
  parentODSCode: string | null;
  partialPostCode: string | null;
  phone: string | null;
  postCode: string;
  sector: string | null;
  website: string | null;
  active: boolean | null;
  townId: number;
  town: any | null;
  city: string | null;
  countyId: number;
  county: any | null;
  townName: string;
  countyName: string;
  departments: any | null;
  customerId: number;
  customer: any | null;
  lastModifiedUser: string | null;
  lastModifiedDate: string;
  dateCreated: string;
  isArchived: boolean;
  [key: string]: any;

}