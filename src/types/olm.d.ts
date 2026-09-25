/**
 * @matrix-org/olm ships `index.d.ts` written for UMD/global (`<script>` tag)
 * consumption: it declares `Account`, `Session`, `Utility`, etc. as
 * unexported `declare class` members and only exposes `init`,
 * `get_library_version`, and `PRIVATE_KEY_LENGTH` as real module exports
 * (verified by reading node_modules/@matrix-org/olm/index.d.ts directly).
 * That means a normal `import Olm from "@matrix-org/olm"` cannot see
 * `Olm.Account` etc. through the package's own types.
 *
 * This module augmentation re-declares the package's actual runtime shape
 * (module.exports = { Account, Session, Utility, init, ... }, confirmed by
 * reading olm.js) so the rest of src/lib/signal gets real type checking
 * instead of `any`. Method signatures are copied 1:1 from the package's own
 * index.d.ts -- only the export shape is fixed here, not the API surface.
 */
declare module "@matrix-org/olm" {
  export class Account {
    constructor();
    free(): void;
    create(): void;
    identity_keys(): string;
    sign(message: string | Uint8Array): string;
    one_time_keys(): string;
    mark_keys_as_published(): void;
    max_number_of_one_time_keys(): number;
    generate_one_time_keys(numberOfKeys: number): void;
    remove_one_time_keys(session: Session): void;
    generate_fallback_key(): void;
    fallback_key(): string;
    unpublished_fallback_key(): string;
    forget_old_fallback_key(): void;
    pickle(key: string | Uint8Array): string;
    unpickle(key: string | Uint8Array, pickle: string): void;
  }

  export class Session {
    constructor();
    free(): void;
    pickle(key: string | Uint8Array): string;
    unpickle(key: string | Uint8Array, pickle: string): void;
    create_outbound(
      account: Account,
      theirIdentityKey: string,
      theirOneTimeKey: string,
    ): void;
    create_inbound(account: Account, oneTimeKeyMessage: string): void;
    create_inbound_from(
      account: Account,
      identityKey: string,
      oneTimeKeyMessage: string,
    ): void;
    session_id(): string;
    has_received_message(): boolean;
    matches_inbound(oneTimeKeyMessage: string): boolean;
    matches_inbound_from(identityKey: string, oneTimeKeyMessage: string): boolean;
    encrypt(plaintext: string): { type: 0 | 1; body: string };
    decrypt(messageType: number, message: string): string;
    describe(): string;
  }

  export class Utility {
    constructor();
    free(): void;
    sha256(input: string | Uint8Array): string;
    ed25519_verify(
      key: string,
      message: string | Uint8Array,
      signature: string,
    ): void;
  }

  export function init(opts?: {
    locateFile?: (path: string) => string;
  }): Promise<void>;
  export function get_library_version(): [number, number, number];
  export const PRIVATE_KEY_LENGTH: number;

  interface OlmModule {
    Account: typeof Account;
    Session: typeof Session;
    Utility: typeof Utility;
    init: typeof init;
    get_library_version: typeof get_library_version;
    PRIVATE_KEY_LENGTH: number;
  }

  const olm: OlmModule;
  export default olm;
}
