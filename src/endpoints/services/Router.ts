import { HttpEndpointFunction } from "../model/HttpEndpointFunction";
import { HttpRequest } from "../model/HttpRequest";
import { HttpResponse } from "../model/HttpResponse";
import { HttpRoute } from "../model/HttpRoute";
import { LambdaContext } from "../model/LambdaContext";
import { EventNormalizer } from "./EventNormalizer";
import { Logger } from "../../utils/Logger";
import { Headers } from "./Headers";
import { SerializerService } from "../../serializers/service/SerializerService";

export class Router {
  private readonly routes: { [key: string]: HttpRoute };

  /**
   * 
   * @param normalizer used to format the event recieved by the lambda function.
   */
  constructor(
    private readonly serializerService: SerializerService,
    private readonly eventNormalizer: EventNormalizer = new EventNormalizer(),
  ) {
    this.routes = {};
  }

  /**
   * 
   * @param route to register with this router.
   * @returns 
   */
  public register(route: HttpRoute): Router {
    const path: string = `${route.path}:${route.action}`;
    this.routes[path] = route;
    return this;
  }

  /**
   * 
   * @param event 
   * @param context see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
   * @returns 
   */
  public async handle(event: any, context: LambdaContext): Promise<HttpResponse> {
    Logger.debug('Router.handler() event recieved.', { event });

    const request: HttpRequest<string> = this.eventNormalizer.normalize(event);

    Logger.debug('Router.handler() normalized request.', { request });

    const { path, action } = request;

    let route: HttpRoute | undefined = this.routes[`${path}:${action}`];

    Logger.debug('Router.handler() Direct check for route found a result?', route !== undefined);

    /**
     * If no route was found for the specific action, look under 'ANY' for the 
     * same path.
     */
    if (!route) route = this.routes[`${path}:ANY`]

    /**
     * If no route is found, then return a 501.
     */

    let response: HttpResponse;
    if (!route) {
      Logger.warn('Router.handler() No route was found.');
      response = {
        body: { message: `The path or action is not implemented "${path}:${action}".`, awsRequestId: context.awsRequestId },
        statusCode: 501,
        statusDescription: `The path or action is not implemented "${path}:${action}".`,
        headers: Headers.get(),
      }
    } else {

      try {

        // TODO engage serialization so that the Content-Type determines the format of the request body

        const handler: HttpEndpointFunction = route.function;

        /**
         * Handler should actively do less, and allow decorators to do their
         * jobs in isolation.
         */
        response = await handler(request, context);

      } catch (error) {
        Logger.error('Router.handler() HttpEndpointFunction implementation threw an exception.', error);
        response = {
          body: { message: 'Unhandled error encountered.' },
          statusCode: 500,
          statusDescription: 'Unhandled error encountered.',
          headers: Headers.get(),
        }
      }
    }

    // TODO engage serialization so that the Accept determines the format of the response body

    return response;
  }
}