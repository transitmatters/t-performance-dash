/* oxlint-disable typescript/no-implied-eval, typescript/no-unsafe-call, typescript/no-unsafe-member-access -- runs
   the CloudFront function's source, which is untyped JS */
import { describe, expect, it } from 'vitest';
import template from '../server/cloudformation.json';

const handler = new Function(
  `${template.Resources.TrailingSlashRedirectFunction.Properties.FunctionCode}\nreturn handler;`
)();

const viewerRequest = (uri: string, query?: string) => {
  const request = { uri, rawQueryString: () => query };
  return { request, response: handler({ request }) };
};

describe('TrailingSlashRedirectFunction', () => {
  it('adds the slash and keeps the query string as sent', () => {
    expect(viewerRequest('/red/service', 'startDate=2026-01-01&to=place-a%2Cb').response).toEqual({
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: '/red/service/?startDate=2026-01-01&to=place-a%2Cb' } },
    });
  });

  it('adds the slash to a path without a query string', () => {
    expect(viewerRequest('/rapidtransit').response.headers.location.value).toBe('/rapidtransit/');
    expect(viewerRequest('/bus', '').response.headers.location.value).toBe('/bus/');
  });

  it('passes paths that already end in a slash, and files, through to S3', () => {
    for (const uri of [
      '/',
      '/red/service/',
      '/assets/index-abc123.js',
      '/static/landing/overview.json',
    ]) {
      const { request, response } = viewerRequest(uri, 'x=1');
      expect(response).toBe(request);
    }
  });
});
