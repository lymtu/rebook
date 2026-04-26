import { ERROR_CODES } from '@rebook/shared';
import { env } from '../../env';
import { AppError } from '../../lib/errors';
import { logger } from '../../lib/logger';

export interface WxSession {
  openid: string;
  unionid?: string;
  sessionKey: string;
}

export async function exchangeWxCode(code: string): Promise<WxSession> {
  if (!env.WX_APPID || !env.WX_SECRET) {
    throw new AppError(
      ERROR_CODES.WX_LOGIN_FAILED,
      500,
      'WeChat credentials are not configured on the server.',
    );
  }
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', env.WX_APPID);
  url.searchParams.set('secret', env.WX_SECRET);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const res = await fetch(url);
  const data = (await res.json()) as {
    openid?: string;
    unionid?: string;
    session_key?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (data.errcode || !data.openid || !data.session_key) {
    logger.warn({ data }, 'WeChat code exchange failed');
    throw new AppError(ERROR_CODES.WX_LOGIN_FAILED, 401, data.errmsg ?? 'wx login failed');
  }

  return { openid: data.openid, unionid: data.unionid, sessionKey: data.session_key };
}
