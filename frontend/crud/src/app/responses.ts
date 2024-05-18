export interface ErrorResponse {
  status: 400|401|402|403|404|405|429|500|501|502|503|504|505;
  message: string;
}

export interface SuccessResponse<T> {
  status: 200|201|202|204
  message: string;
  data: T;
}
