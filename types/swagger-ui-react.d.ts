declare module "swagger-ui-react" {
  import { FunctionComponent } from "react";

  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    [key: string]: any;
  }

  const SwaggerUI: FunctionComponent<SwaggerUIProps>;
  export default SwaggerUI;
}
