import { HttpRequest, HttpResponse, LambdaContext } from '@';

export interface HttpEndpointFunction extends Function {
    /**
     *
     * Intentionally not supporting the callback pattern.
     * @param event the event payload from an HttpApi event.
     * @param context of the invocation.
     */
    <T>(event: HttpRequest<T>, context?: LambdaContext): Promise<HttpResponse>;
}