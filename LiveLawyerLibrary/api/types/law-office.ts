// Data:

export interface LawOfficeDetailsSingle {
  name: string
  lawyers: { id: string; name: string }[]
}

// Router for: /law-office
export const ROUTER_LAW_OFFICE = '/law-office'

// Route: /details
export const ROUTE_LAW_OFFICE_DETAILS = '/details'

export interface RequestParamsLawOfficeDetails {
  officeId: string
}

export interface RequestResponseLawOfficeDetails {
  details: LawOfficeDetailsSingle
}
