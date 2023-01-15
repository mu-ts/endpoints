import { HttpHandler } from "../../HttpHandler";
import { HttpAction } from "../model/HttpAction";

/**
 * 
 * @param path definition for this POST action mapping. This would include the path names ie, /pathy/{id}
 * @param validation schema for validating the payload of the request body. If it is not valid the endpoint
 *        function will not be invoked.
 * @returns 
 */
export function post(path: string, validation?: object, deserialize?: object, serialize?: object) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    /**
     * De-serialize the request body into an object for the validators to use.
     */
     HttpHandler.instance().router().register({
      function: descriptor.value.bind(target),
      action: HttpAction.POST,
      path,
      validation,
      deserialize,
      serialize
    });
  
    return descriptor;
  };
}