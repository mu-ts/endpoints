import { EndpointRouter } from '../EndpointRouter';
import { HTTPAction } from '../model/HTTPAction';
import { Validation } from '../interfaces/Validation';
import { EndpointEvent } from '../model/EndpointEvent';
import { EventCondition } from '../interfaces/EventCondition';
import { HTTPAPIGatewayProxyResult } from '../HTTPAPIGatewayProxyResult';
import { EndpointRoutes } from '../EndpointRoutes';
import { LoggerService, Logger, LoggerConfig } from '@mu-ts/logger';

/**
 *
 * @param action to trigger this endpoint.
 * @param path after the 'endpoints()' prefix.
 * @param condition of when this endpoint will execute.
 * @param priority of this endpoint vs other registered endpoints.
 */
export function endpoint(action: HTTPAction | string, path?: string, condition?: EventCondition, priority?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const parent: string = target.constructor.name;
    const logConfig: LoggerConfig = { name: `${parent}.endpoint`, adornments: { '@mu-ts': 'endpoints' } };
    const logger: Logger = LoggerService.named(logConfig);
    const targetMethod = descriptor.value;

    logger.debug({ action, path, condition, priority, propertyKey }, 'endpoint()', 'decorating function');

    descriptor.value = function (): Promise<HTTPAPIGatewayProxyResult> {
      const event: EndpointEvent<any> = arguments[0];
      const validations: Array<Validation> = arguments[2];

      /*
       * Schema and general validation
       */
      if (validations) {
        const validationErrors = new Set<string>();

        validations.forEach((validation) => {
          if (!validation.validatorCondition || validation.validatorCondition(event.body, event)) {
            const errors: string[] | void = EndpointRouter.validationHandler.validate(event.body, validation.schema);
            if (errors) {
              errors.forEach((item) => validationErrors.add(item));
            }
          }
        });

        if (validationErrors.size > 0) {
          logger.error({ data: { validationErrors } }, 'endpoint() - failed validation');

          return Promise.resolve(
            HTTPAPIGatewayProxyResult.setBody({ message: Array.from(validationErrors) })
              .setStatusCode(400)
              .addHeader('Access-Control-Allow-Origin', '*')
              .addHeader('Access-Control-Allow-Headers', '*')
              .addHeader('X-REQUEST-ID', event.requestContext.requestId)
          );
        }
      }

      return targetMethod
        .apply(this, arguments)
        .then((response: HTTPAPIGatewayProxyResult) => {
          logger.debug({ data: response }, 'endpoint() - response');
          response.addHeader('X-REQUEST-ID', event.requestContext.requestId);
          return response;
        })
        .catch((error: any) => {
          logger.error(error, 'endpoint() - problem executing function');
          return HTTPAPIGatewayProxyResult.setBody({ message: error.message }).setStatusCode(501).addHeader('X-REQUEST-ID', event.requestContext.requestId);
        });
    };

    logger.debug({ data: { path, action: ('' + action).toUpperCase() } }, 'endpoint() registering');

    EndpointRoutes.register(target, path, ('' + action).toUpperCase(), descriptor.value, descriptor, condition, priority);

    return descriptor;
  };
}
