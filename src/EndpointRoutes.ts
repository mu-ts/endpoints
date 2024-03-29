import 'reflect-metadata';
import { Logger, LoggerService, LogLevelString } from '@mu-ts/logger';
import { EndpointRoute, EventCondition, Validation } from './interfaces';

const METADATA_KEY: string = '__mu-ts_endpoints';
const METADATA_VALIDATE_KEY: string = '__mu-ts_validate';

export class EndpointRoutes {
  private static _routes: EndpointRoute[] = [];
  private static _validations: Validation[] = [];
  private static _instances: Map<string, any> = new Map();
  private static logger: Logger = LoggerService.named({ name: 'EndpointRoutes', adornments: { '@mu-ts': 'endpoints' } });

  /**
   *
   * @param level
   */
  public static setLogLevel(level: LogLevelString): void {
    this.logger.setLevel(level);
  }

  /**
   *
   */
  public static getRoutes(): EndpointRoute[] {
    return EndpointRoutes._routes;
  }

  /**
   *
   * @param condition to execute against array of routes to determine if the route is located.
   */
  public static find(condition: Function): EndpointRoute | undefined {
    this.logger.debug({ condition }, 'find()');
    return this._routes.find((value: EndpointRoute, index: number) => condition(value, index));
  }

  /**
   *
   * @param target to attach endpoints to.
   * @param pathPrefix to put in front of every path.
   * @param instanceArgs arguments to supply into the constructor of the instance.
   */
  public static init(target: any, pathPrefix: string = '', instanceArgs?: any[]): void {
    this.logger.debug({ data: { pathPrefix, target } }, 'init()', ' --> ');
    const validations: Validation[] = Reflect.getMetadata(METADATA_VALIDATE_KEY, target as Function) || [];
    this._validations.push(...validations);

    const paths: EndpointRoute[] = Reflect.getMetadata(METADATA_KEY, target as Function) || [];

    this.logger.debug({ data: { paths } }, 'init()', ' -- ');

    paths.forEach((path: EndpointRoute) => {
      path.resource = `${pathPrefix || ''}${path.resource || ''}`;
      if (!path.resource || path.resource.trim() === '') {
        throw Error('Both @endpoints does not contain a prefix and @endpoint does not contain a path.');
      }

      const _instance: any = EndpointRoutes.getInstance(target, instanceArgs);

      path.endpoint = path.endpoint.bind(_instance);

      this.logger.debug({ data: { path, name: target['name'] } }, 'init()', 'path');
      this._routes.push(path);

      this.logger.debug({ data: { path } }, 'init()', ' <-- ');
    });

    this.logger.debug({ data: { paths } }, 'init() <-- ');
  }

  /**
   *
   * @param _constructor to invoke a new instance of.
   * @param _instanceArgs arguments to supply into the constructor of the instance.
   */
  private static getInstance(_constructor: any, _instanceArgs?: any | any[]): any {
    this.logger.debug({ data: { _constructor, _instanceArgs: (_instanceArgs) ? Object.keys(_instanceArgs) : undefined } }, 'getInstance()', '--> ');
    let instance = this._instances.get(_constructor['name']);
    if (!instance) {
      this.logger.debug({ data: { name: _constructor['name'] } }, 'getInstance()', ' -- creating instance ');
      if (!_instanceArgs) {
        instance = new _constructor();
      } else {
        /**
         * Apply is 1 based instead of 0 based, so insert a null at the beginning
         * to align values with apply.
         */
        const instanceArgs: any | any[] = [undefined].concat(_instanceArgs);
        instance = new (Function.prototype.bind.apply(_constructor, instanceArgs))();
      }
      this._instances.set(_constructor['name'], instance);
    }
    this.logger.debug({ data: { instance: !!instance } }, 'getInstance()', ' <-- ');
    return instance;
  }

  /**
   *
   * @param target class to attach endpoints to.
   * @param resource to map this endpoint to.
   * @param action to map this endpoint to.
   * @param endpoint function that will take event: HTTPEvent as the first argument
   *        and context: LambdaContext as the second argument. It is expected that
   *        it will return Promise<HTTPResponse>
   * @param descriptor the property descriptor from the method, used to bind the
   *        validation back to the endpoint in the handle() phase
   * @param condition?, that if provided, will test if this endpoint should even
   *        be invoked.
   * @param priority? of this endpoint. A higher value indicates it should be
   *        executed ahead of other endpoints. Defaults to 0.
   *
   */
  public static register(
    target: any,
    resource: string | undefined,
    action: string,
    endpoint: Function,
    descriptor: PropertyDescriptor,
    condition?: EventCondition,
    priority?: number
  ): void {
    const routeAction = typeof action === 'string' ? action.toUpperCase() : action;
    const paths: EndpointRoute[] = Reflect.getMetadata(METADATA_KEY, target.constructor) || [];
    paths.push({
      descriptor: descriptor,
      resource: resource,
      action: routeAction,
      endpoint: endpoint,
      condition: condition,
      priority: priority || 0,
    });
    Reflect.defineMetadata(METADATA_KEY, paths, target.constructor);
    this.logger.debug({ data: { resource, action, condition, priority } }, 'register()', 'path');
  }

  public static registerValidation(target: any, validation: Validation): void {
    const validators: Validation[] = Reflect.getMetadata(METADATA_VALIDATE_KEY, target.constructor) || [];
    validators.push(validation);
    Reflect.defineMetadata(METADATA_VALIDATE_KEY, validators, target.constructor);
  }

  public static getValidators(): Validation[] {
    return this._validations;
  }
}
