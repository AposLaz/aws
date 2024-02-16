import { APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';
import * as crypto from 'crypto';

export type HubspotProps = {
    hubspotSignature: string | undefined;
    hubspotTimestamp: string;
    hubspotClientSecret: string | undefined;
    httpMethod: string;
    domainName: string | undefined;
    path: string;
    rawQueryString: string;
    rawBody: string;
};

export function verifyV3signature({
    hubspotSignature,
    hubspotTimestamp,
    hubspotClientSecret,
    httpMethod,
    domainName,
    path,
    rawQueryString,
    rawBody,
}: HubspotProps): boolean {
    const body = rawBody || '';
    const uri = `https://${domainName}/v1${path}?${rawQueryString}`;
    const secretConcat = httpMethod + uri + body + hubspotTimestamp;
    const hash = crypto
        .createHmac('sha256', hubspotClientSecret || '')
        .update(secretConcat)
        .digest('base64');
    return hubspotSignature === hash;
}

export function hubspotSignatureVerifier(event: APIGatewayRequestAuthorizerEventV2, hubspotSecret: string) {
    const props = {
        hubspotSignature: event.headers?.['x-hubspot-signature-v3'] || '',
        hubspotTimestamp: event.headers?.['x-hubspot-request-timestamp'] || '',
        hubspotClientSecret: hubspotSecret,
        httpMethod: event.requestContext.http.method,
        domainName: event.requestContext.domainName,
        path: event.requestContext.http.path,
        rawQueryString: event.rawQueryString,
        rawBody: '',
    };

    return verifyV3signature(props);
}
