export interface ColumnHeaderModel {
    prettyName: string,
    technicalName: string,
    selected?: boolean,
    value?: any,
    visible?: boolean
}


export interface GridItem {
    id: number;
    title: string;
    assetNumber: string;
    serialNumber: string;
    bookedDate: string | null;
    dueDate: string;
    dateCreated: string;
    completionDate: string | null;
    nextDueDate: string | null;
    jobType: string;
    jobTypeId: number;
    status: string;
    statusId: number;
    jobStatusType: number;
    userName: string;
    userId: number;
    customer: string;
    customerId: number;
    department: string;
    departmentId: number;
    surveyId: number;
    surveyTitle: string | null;
    siteName: string;
    siteAddress1: string;
    siteAddress2: string | null;
    sitePostCode: string;
    equipmentId: number;
    jobReference: string | null;
    contactFirstName: string;
    contactSurname: string;
    contactPhone: string;
    contactMobile: string;
    contactEmail: string;
    equipmentModel: string;
    equipmentType: string | null;
    manufacturerName: string;
    childCustomerCount: number | null; // Optional property for child customer count
    [key: string]: any;
}