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

  private async fetchFromApi<Q extends object, R extends object>(
    router: string,
    route: string,
    queryParams: Q,
  ): Promise<R> {
    const encodedQueryParams = `${new URLSearchParams({ accessToken: this._accessTokenFetcher(), ...queryParams })}`
    const response = await fetch(new URL(`${router + route}?${encodedQueryParams}`, this._baseUrl))
    const json = (await response.json()) as ApiResponse<R>
    if (json.success) {
      return json.result
    } else {
      throw new Error(json.error)
    }
  }

  public async fetchCallHistory(): Promise<RequestResponseCallHistoryList> {
    return await this.fetchFromApi<RequestParamsCallHistoryList, RequestResponseCallHistoryList>(
      ROUTER_CALL_HISTORY,
      ROUTE_CALL_HISTORY_LIST,
      {},
    )
  }

  public async fetchCallDetails(callId: string): Promise<RequestResponseCallHistoryDetails> {
    return await this.fetchFromApi<
      RequestParamsCallHistoryDetails,
      RequestResponseCallHistoryDetails
    >(ROUTER_CALL_HISTORY, ROUTE_CALL_HISTORY_DETAILS, { callId })
  }

  public async fetchCallDownload(recordingId: string): Promise<RequestResponseCallHistoryDownload> {
    return await this.fetchFromApi<
      RequestParamsCallHistoryDownload,
      RequestResponseCallHistoryDownload
    >(ROUTER_CALL_HISTORY, ROUTE_CALL_HISTORY_DOWNLOAD, { recordingId })
  }

  public async fetchLawOfficeDetails(officeId: string): Promise<RequestResponseLawOfficeDetails> {
    return await this.fetchFromApi<RequestParamsLawOfficeDetails, RequestResponseLawOfficeDetails>(
      ROUTER_LAW_OFFICE,
      ROUTE_LAW_OFFICE_DETAILS,
      { officeId },
    )
  }
}
