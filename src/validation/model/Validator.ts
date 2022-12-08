import { HttpRequest } from "../../endpoints/model/HttpRequest";
import { HttpResponse } from "../../endpoints/model/HttpResponse";

export interface Validator<T> {
  validate(schema: object, request: HttpRequest<string>): T[] | undefined;
  format?(errors: T[], request: HttpRequest<string>): HttpResponse;
}