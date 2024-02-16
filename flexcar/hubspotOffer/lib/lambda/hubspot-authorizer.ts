import { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerResult } from 'aws-lambda';
import { hubspotSignatureVerifier } from './hubspot-verifier';

export const handler = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewaySimpleAuthorizerResult> => {
    const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET as string;

    let isAuthorized = false;

    if (event.headers && event.headers?.['x-hubspot-signature-v3']) {
        isAuthorized = hubspotSignatureVerifier(event, HUBSPOT_CLIENT_SECRET);
    }
    return {
        isAuthorized,
    };
};
