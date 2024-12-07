import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const ApiDocs: React.FC = () => {
  return <SwaggerUI url="/api/swagger" />;
};

export default ApiDocs;
