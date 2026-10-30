/**
 * @fileoverview Robust Result<T, E> discriminated union for functional error handling.
 */

export interface OkResult<T> {
  readonly ok: true;
  readonly value: T;
}

export interface ErrResult<E> {
  readonly ok: false;
  readonly error: E;
}

export type Result<T, E = Error> = OkResult<T> | ErrResult<E>;

export function okResult<T>(value: T): OkResult<T> {
  return { ok: true, value };
}

export function errResult<E>(error: E): ErrResult<E> {
  return { ok: false, error };
}

export const ResultUtil = {
  ok: okResult,
  err: errResult,
};
