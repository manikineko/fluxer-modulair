/* tslint:disable */
/* eslint-disable */

export function crop_and_rotate_apng(input: Uint8Array, x: number, y: number, width: number, height: number, rotation_deg: number, resize_width?: number | null, resize_height?: number | null): Uint8Array;

export function crop_and_rotate_gif(input: Uint8Array, x: number, y: number, width: number, height: number, rotation_deg: number, resize_width?: number | null, resize_height?: number | null): Uint8Array;

export function crop_and_rotate_image(input: Uint8Array, format_hint: string, x: number, y: number, width: number, height: number, rotation_deg: number, resize_width?: number | null, resize_height?: number | null): Uint8Array;

export function decompress_zstd_frame(input: Uint8Array): Uint8Array;

export function is_animated_image(input: Uint8Array): boolean;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly crop_and_rotate_apng: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number, number];
    readonly is_animated_image: (a: number, b: number) => number;
    readonly crop_and_rotate_gif: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number, number];
    readonly crop_and_rotate_image: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number, number];
    readonly decompress_zstd_frame: (a: number, b: number) => [number, number, number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
