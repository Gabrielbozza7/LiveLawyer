import {
  RequestParamsCallHistoryDetails,
  RequestParamsCallHistoryDownload,
  RequestParamsCallHistoryList,
  RequestResponseCallHistoryDetails,
  RequestResponseCallHistoryDownload,
  RequestResponseCallHistoryList,
  ROUTE_CALL_HISTORY_DETAILS,
  ROUTE_CALL_HISTORY_DOWNLOAD,
  ROUTE_CALL_HISTORY_LIST,
  ROUTER_CALL_HISTORY,
} from './types/call-history'
import {
  RequestBodyContactsModify,
  RequestParamsContactsList,
  RequestResponseContactsList,
  RequestResponseContactsModify,
  ROUTE_CONTACTS_LIST,
  ROUTE_CONTACTS_MODIFY,
  ROUTER_CONTACTS,
} from './types/contacts'
import { ApiResponse } from './types/general'
import {
  RequestParamsLawOfficeDetails,
  RequestResponseLawOfficeDetails,
  ROUTE_LAW_OFFICE_DETAILS,
  ROUTER_LAW_OFFICE,
} from './types/law-office'

export default class LiveLawyerApi {
  private readonly _baseUrl: string
  private readonly _accessTokenFetcher: () => string

  constructor(backendUrl: string, accessTokenFetcher: () => string) {
    this._baseUrl = backendUrl
    this._accessTokenFetcher = accessTokenFetcher
  }

  private async getFromApi<Q extends object, R extends object>(
    router: string,
    route: string,
    queryParams: Q,
  ): Promise<R> {
    const encodedQueryParams = `${new URLSearchParams({ accessToken: this._accessTokenFetcher(), ...queryParams })}`
    const response = await fetch(this._baseUrl + `${router + route}?${encodedQueryParams}`)
    const json = (await response.json()) as ApiResponse<R>
    if (json.success) {
      return json.result
    } else {
      throw new Error(json.error)
    }
  }

  private async postToApi<B extends object, R extends object>(
    router: string,
    route: string,
    bodyParams: B,
  ): Promise<R> {
    const encodedBodyParams = JSON.stringify({
      accessToken: this._accessTokenFetcher(),
      ...bodyParams,
    })
    const response = await fetch(this._baseUrl + `${router + route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: encodedBodyParams,
    })
    const json = (await response.json()) as ApiResponse<R>
    if (json.success) {
      return json.result
    } else {
      throw new Error(json.error)
    }
  }

  public async fetchCallHistory(): Promise<RequestResponseCallHistoryList> {
    return await this.getFromApi<RequestParamsCallHistoryList, RequestResponseCallHistoryList>(
      ROUTER_CALL_HISTORY,
      ROUTE_CALL_HISTORY_LIST,
      {},
    )
  }

  public async fetchCallDetails(callId: string): Promise<RequestResponseCallHistoryDetails> {
    return await this.getFromApi<
      RequestParamsCallHistoryDetails,
      RequestResponseCallHistoryDetails
    >(ROUTER_CALL_HISTORY, ROUTE_CALL_HISTORY_DETAILS, { callId })
  }

  public async fetchContacts(): Promise<RequestResponseContactsList> {
    return await this.getFromApi<RequestParamsContactsList, RequestResponseContactsList>(
      ROUTER_CONTACTS,
      ROUTE_CONTACTS_LIST,
      {},
    )
  }

  public async modifyContact(
    phoneNumber: string,
    name: string | null,
  ): Promise<RequestResponseContactsModify> {
    return await this.postToApi<RequestBodyContactsModify, RequestResponseContactsModify>(
      ROUTER_CONTACTS,
      ROUTE_CONTACTS_MODIFY,
      {
        phoneNumber,
        name,
      },
    )
  }

  public async fetchCallDownload(recordingId: string): Promise<RequestResponseCallHistoryDownload> {
    return await this.getFromApi<
      RequestParamsCallHistoryDownload,
      RequestResponseCallHistoryDownload
    >(ROUTER_CALL_HISTORY, ROUTE_CALL_HISTORY_DOWNLOAD, { recordingId })
  }

  public async fetchLawOfficeDetails(officeId: string): Promise<RequestResponseLawOfficeDetails> {
    return await this.getFromApi<RequestParamsLawOfficeDetails, RequestResponseLawOfficeDetails>(
      ROUTER_LAW_OFFICE,
      ROUTE_LAW_OFFICE_DETAILS,
      { officeId },
    )
  }
}
