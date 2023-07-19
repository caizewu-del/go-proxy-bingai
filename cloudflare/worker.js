const SYDNEY_ORIGIN = 'https://sydney.bing.com';
const KEEP_REQ_HEADERS = [
  'accept',
  'accept-encoding',
  'accept-language',
  'connection',
  'cookie',
  'upgrade',
  'user-agent',
  'sec-websocket-extensions',
  'sec-websocket-key',
  'sec-websocket-version',
  'x-request-id',
  'content-length',
  'content-type',
  'access-control-request-headers',
  'access-control-request-method',
];
const IP_RANGE = [
  ['3.2.50.0', '3.5.31.255'], //192,000
  ['3.12.0.0', '3.23.255.255'], //786,432
  ['3.30.0.0', '3.33.34.255'], //205,568
  ['3.40.0.0', '3.63.255.255'], //1,572,864
  ['3.80.0.0', '3.95.255.255'], //1,048,576
  ['3.100.0.0', '3.103.255.255'], //262,144
  ['3.116.0.0', '3.119.255.255'], //262,144
  ['3.128.0.0', '3.247.255.255'], //7,864,320
];

/**
 * 随机整数 [min,max)
 * @param {number} min
 * @param {number} max
 * @returns
 */
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

/**
 * ip 转 int
 * @param {string} ip
 * @returns
 */
const ipToInt = (ip) => {
  const ipArr = ip.split('.');
  let result = 0;
  result += +ipArr[0] << 24;
  result += +ipArr[1] << 16;
  result += +ipArr[2] << 8;
  result += +ipArr[3];
  return result;
};

/**
 * int 转 ip
 * @param {number} intIP
 * @returns
 */
const intToIp = (intIP) => {
  return `${(intIP >> 24) & 255}.${(intIP >> 16) & 255}.${(intIP >> 8) & 255}.${intIP & 255}`;
};

const getRandomIP = () => {
  const randIndex = getRandomInt(0, IP_RANGE.length);
  const startIp = IP_RANGE[randIndex][0];
  const endIp = IP_RANGE[randIndex][1];
  const startIPInt = ipToInt(startIp);
  const endIPInt = ipToInt(endIp);
  const randomInt = getRandomInt(startIPInt, endIPInt);
  const randomIP = intToIp(randomInt);
  return randomIP;
};

/**
 * home
 * @param {string} pathname
 * @returns
 */
const home = async (pathname) => {
  const baseUrl = 'https://raw.githubusercontent.com/adams549659584/go-proxy-bingai/master/';
  let url;
  // if (pathname.startsWith('/github/')) {
  if (pathname.indexOf('/github/') === 0) {
    url = pathname.replace('/github/', baseUrl);
  } else {
    url = baseUrl + 'cloudflare/index.html';
  }
  const res = await fetch(url);
  const newRes = new Response(res.body, res);
  if (pathname === '/') {
    newRes.headers.delete('content-security-policy');
    newRes.headers.set('content-type', 'text/html; charset=utf-8');
  }
  return newRes;
};

export default {
  /**
   * fetch
   * @param {Request} request
   * @param {*} env
   * @param {*} ctx
   * @returns
   */
  async fetch(request, env, ctx) {
    const currentUrl = new URL(request.url);
    // if (currentUrl.pathname === '/' || currentUrl.pathname.startsWith('/github/')) {
    if (currentUrl.pathname === '/' || currentUrl.pathname.indexOf('/github/') === 0) {
      return home(currentUrl.pathname);
    }
    const targetUrl = new URL(SYDNEY_ORIGIN + currentUrl.pathname + currentUrl.search);

    const newHeaders = new Headers();
    request.headers.forEach((value, key) => {
      // console.log(`old : ${key} : ${value}`);
      if (KEEP_REQ_HEADERS.includes(key)) {
        newHeaders.set(key, value);
      }
    });
    newHeaders.set('host', targetUrl.host);
    newHeaders.set('origin', targetUrl.origin);
    newHeaders.set('referer', 'https://www.bing.com/search?q=Bing+AI');
    newHeaders.set('KievRPSSecAuth', 'FABSBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACAH42Bz/nofNEAThvJ6Js8Vbx0Zs2EWwZNGLdo2CsRrZFG1lRxTSpSrBBWtegc4T+cFGI7GS7uNhtbMBqsLxli5LDn2v9BrctGoVUbFohMrVyIF4UyrMXfabW99TCVxoPr9Do1WFQNKk2UnzmQoXDDmqELt6L76gsiE+ycOlVpfS9kJx0PkWi2Avzugbc/6W27R348hEYtBctwJjgjeSK68YnK6cqXp0T1vRUUkJoRAG1ZcZmx+01LrsJ5IyQR7pgXT2DqK2TfZVMl7EoKwURhlEw06MGkjla2Goow3+pdN5HGkrkMSodx+2K9bgK+yb02XC42Nkl/rlWwubibvtvze9DTSeQfGzvNLIg+zkemy2roHc0iPipZxPeOP1mRH126+AQ0dxV0Z56TNk3t4sXEUmyh1d5ZiRRBZqrSwrmwrbsSiSNBoTk7znitPqbnIBLklFK/3A/nktwRQGmmmA5HUSjlrWsXmLS1fetUr5AL4/uS4E6KoMsy0hgYXbFHATyeEt3Q55LFwtDAEibQ0O1xep5roCKlWMdXE6EhLJP0bjW+/nivEiU89PT2lOcUmKvFn/JkDkn+gnScR5wyfnL5vIcxCRNhtym1k4zsKZriLxlmtU+jqjGSKrULV7mfQa55vjZpEz7VPOBskQB0qs0u+A772KR7dq1LZBogkBYofAoJvZ9RP6caoMsebp1AgZqdZCTzM8WtpezyOmZmhxNJ3WN0QImr8O4J/yI/pBPOuMnQozFCso7EpbFp0LQDAV5im2Nb0aZaxq+T0BL2epOVRgcmgfzNaKarY0smQpQsA2JRKStyfzO91i/uoFFF7gKr/1fIqO8VBg+uZ9pNbLKaJQPumERnNB3+aQ6nGwB+E6kERZY5Le60haFF7aQ54IxiLSj3RlawF1QPEzuaaTnDpzzLj5vAMj6i3AqvkFmtgMH1e0dReMaOwQYkEeAmd3Nqosu9eHGuVZ/KkooWEEg7yAlYMeB3e5hbXRp8migj2uugzRuAOcv3ZAJREunXovEY6BdyKNTOMpskTb0z90y8QTJwk3eLTskar2sMHxqcn1dY9uzD4M0raa0iwDU+tFbC2mZDRiK5BcvmD2DTyVPkNdYeXQDn+IafNmCIFkTjn0JPuxx0RJbLtTJb0RwM5dvLySmiR2BLFYJs16+4x6v1uEM2GEg/J5tvt1JuGlVnNjcRryMpbgLAO1sug18AzABwH0neTe/0dAcHJN3LGkryBDFFBVzOViLRBxakwp+JJ52M+kBU5VhRfMgKc6LVWO1dhf2xxfRntYpKm2tFuoxXVQyqJLSKJ8SWje94MIbF25oJcoUCLLhlBVlF+f4Aaxs1kGed+9SGpxUDklEPZD+DKHHm7tokDwqoPsm+HgpgLjDj+UFZ1eqV9fsRQAwnSgOAH0rpr76xrdfNHlJZagvk8=');
    const randIP = getRandomIP();
    // console.log('randIP : ', randIP);
    newHeaders.set('X-Forwarded-For', randIP);
    const oldUA = request.headers.get('user-agent');
    const isMobile = oldUA.includes('Mobile') || oldUA.includes('Android');
    if (isMobile) {
      newHeaders.set(
        'user-agent',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7 Mobile/15E148 Safari/605.1.15 BingSapphire/1.0.410427012'
      );
    } else {
      newHeaders.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35');
    }

    // newHeaders.forEach((value, key) => console.log(`${key} : ${value}`));
    const newReq = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.body,
    });
    // console.log('request url : ', newReq.url);
    const res = await fetch(newReq);
    return res;
  },
};
