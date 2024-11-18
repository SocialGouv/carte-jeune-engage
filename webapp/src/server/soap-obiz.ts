import { IOptions } from "soap";

export const obiz_soap_client_url = process.env.OBIZ_SOAP_URL;

function parseMultipartResponse(data: string) {
  // Find the XML content between the MIME boundaries
  const xmlMatch = data.match(/<s:Envelope[\s\S]*?<\/s:Envelope>/);
  if (xmlMatch) {
    return xmlMatch[0];
  }
  throw new Error("No SOAP envelope found in response");
}

export const obiz_soap_client_options: IOptions = {
  forceSoap12Headers: false,
  endpoint: `https://${process.env.OBIZ_SOAP_HOST}/Partenaire.svc/Partenaire.svc`,
  httpClient: {
    request: function (
      url: string,
      data: string,
      callback: any,
      exheaders: any
    ): any {
      const headers = {
        "Content-Type": "text/xml;charset=utf-8",
        Accept: "multipart/related,text/xml",
        ...exheaders,
      };

      const options = {
        url: url,
        method: data ? "POST" : "GET",
        headers: headers,
        data: data,
        responseType: "text",
      };

      require("axios")(options)
        .then((response: any) => {
          if (response.headers["content-type"]?.includes("multipart/related")) {
            // Parse multipart response to get just the SOAP envelope
            const xmlContent = parseMultipartResponse(response.data);
            response.data = xmlContent;
          }
          callback(null, response, response.data);
        })
        .catch((error: any) => callback(error));
    },
  },
};
