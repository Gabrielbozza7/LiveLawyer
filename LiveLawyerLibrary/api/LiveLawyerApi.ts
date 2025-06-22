import {
  RequestParamsCallHistoryDetails,
  RequestParamsCallHistoryList,
  RequestResponseCallHistoryDetails,
  RequestResponseCallHistoryList,
  ROUTE_CALL_HISTORY_DETAILS,
  ROUTE_CALL_HISTORY_LIST,
  ROUTER_CALL_HISTORY,
} from './types/call-history'
import { ApiResponse } from './types/general'

export default class LiveLawyerApi {
  private readonly _baseUrl: string
  private readonly _accessToken: string

  constructor(backendUrl: string, accessToken: string) {
    this._baseUrl = backendUrl
    this._accessToken = accessToken
  }

  private async fetchFromApi<Q extends object, R extends object>(
    router: string,
    route: string,
    queryParams: Q,
    accessToken: string,
  ): Promise<R> {
    const encodedQueryParams = `${new URLSearchParams({ accessToken, ...queryParams })}`
    const response = await fetch(new URL(`${router + route}?${encodedQueryParams}`, this._baseUrl))
    const json = (await response.json()) as ApiResponse<R>
    if (json.success === true) {
      return json.result
    } else if (json.success === false) {
      throw new Error(json.error)
    }
  }

  public async fetchCallHistory(): Promise<RequestResponseCallHistoryList> {
    return await this.fetchFromApi<RequestParamsCallHistoryList, RequestResponseCallHistoryList>(
      ROUTER_CALL_HISTORY,
      ROUTE_CALL_HISTORY_LIST,
      {},
      this._accessToken,
    )
  }

  public async fetchCallDetails(callId: string): Promise<RequestResponseCallHistoryDetails> {
    return await this.fetchFromApi<
      RequestParamsCallHistoryDetails,
      RequestResponseCallHistoryDetails
    >(ROUTER_CALL_HISTORY, ROUTE_CALL_HISTORY_DETAILS, { id: callId }, this._accessToken)
  }
}
