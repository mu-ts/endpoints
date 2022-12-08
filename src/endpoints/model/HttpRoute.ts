import { HttpAction } from "./HttpAction";
import { HttpEndpointFunction } from "./HttpEndpointFunction";

/**
 * Represents a single HTTP route along with all of the
 * mapped functions.
 */
export interface HttpRoute {
    action: HttpAction;
    path: string;
    function: HttpEndpointFunction;
}