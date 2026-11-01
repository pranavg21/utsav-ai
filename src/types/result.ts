/**
 * @fileoverview Robust Result<T, E> discriminated union for functional error handling.
 */

/** Successful result containing a computation value. */
export interface OkResult<T> {
  readonly ok: true;
  readonly value: T;
}

/** Failed result containing an error descriptor. */
export interface ErrResult<E> {
  readonly ok: false;
  readonly error: E;
}

/** Discriminated union representing either success (Ok) or failure (Err). */
export type Result<T, E = Error> = OkResult<T> | ErrResult<E>;

/**
 * Creates a successful Ok result wrapping a value.
 * @param value Success value.
 * @returns OkResult wrapping the value.
 */
export function okResult<T>(value: T): OkResult<T> {
  return { ok: true, value };
}

/**
 * Creates a failed Err result wrapping an error.
 * @param error Error value or message.
 * @returns ErrResult wrapping the error.
 */
export function errResult<E>(error: E): ErrResult<E> {
  return { ok: false, error };
}

/** Utility namespace for constructing Result instances. */
export const ResultUtil = {
  ok: okResult,
  err: errResult,
};
