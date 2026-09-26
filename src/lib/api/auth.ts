import { api } from "./http";

/**
 * ماژول Auth — مطابق docs/api/auth.md.
 * الگو: تابع نازک روی `api`، تایپ صریح ورودی/خروجی.
 * endpointهای otp/verify/refresh بدون احراز هویت‌اند (`auth: false`).
 */

export type OtpRequestInput = {
  /** 09xxxxxxxxx یا +989… */
  mobile: string;
  referralCode?: string | null;
};

export type OtpRequestResult = {
  /** اعتبار کد (ثانیه) */
  expiresIn: number;
  /** فاصله تا امکان ارسال مجدد (ثانیه) */
  resendAfter: number;
  /** فقط وقتی OTP_DEV_ECHO=true روی بک‌اند */
  devCode?: string;
};

export type OtpVerifyInput = {
  mobile: string;
  code: string;
  /** ادغام سبد مهمان (در پنل استفاده نمی‌شود) */
  cartToken?: string | null;
};

export type SessionUser = {
  id: string;
  fullName: string | null;
  mobile: string;
  email: string | null;
  role: string;
  referralCode: string | null;
};

export type OtpVerifyResult = {
  accessToken: string;
  /** عمر access token (ثانیه) */
  expiresIn: number;
  refreshToken: string;
  isNewUser: boolean;
  user: SessionUser;
};

export type RefreshResult = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export type UpdateProfileInput = {
  fullName?: string;
  email?: string;
};

/** POST /auth/otp/request */
export const requestOtp = (input: OtpRequestInput) =>
  api.post<OtpRequestResult>("/auth/otp/request", input, { auth: false });

/** POST /auth/otp/verify */
export const verifyOtp = (input: OtpVerifyInput) =>
  api.post<OtpVerifyResult>("/auth/otp/verify", input, { auth: false });

/** POST /auth/refresh — توکن نوسازی چرخانده می‌شود (قبلی باطل) */
export const refresh = (refreshToken: string) =>
  api.post<RefreshResult>("/auth/refresh", { refreshToken }, { auth: false });

/** GET /auth/me */
export const getCurrentUser = () => api.get<SessionUser>("/auth/me");

/** POST /auth/logout — همه refresh tokenهای کاربر باطل می‌شوند (۲۰۴) */
export const logout = () => api.post<void>("/auth/logout");

/** PATCH /auth/me */
export const updateProfile = (input: UpdateProfileInput) =>
  api.patch<SessionUser>("/auth/me", input);
