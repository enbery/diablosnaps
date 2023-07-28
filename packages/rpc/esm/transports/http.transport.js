var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RPC } from '@diablosnaps/common';
import { TransportError, TransportErrorCode } from '../errors';
export class HttpTransport {
    constructor() {
        this.tries = 0;
        this.port = -1;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const port = RPC.MIN_PORT + (this.tries % 10);
            try {
                const controller = new AbortController();
                const response$ = fetch(`http://localhost:${port}/connect`, {
                    signal: controller.signal,
                });
                const timeout = setTimeout(() => controller.abort(), 250);
                const response = yield response$;
                clearTimeout(timeout);
                if (response.ok) {
                    this.tries = 0;
                    this.port = port;
                    return;
                }
            }
            catch (_a) {
                if (++this.tries >= 20) {
                    this.tries = 0;
                    throw new TransportError('Could not connect to RPC server.', TransportErrorCode.ConnectionError);
                }
                yield this.connect();
            }
        });
    }
    send(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.port === -1) {
                throw new TransportError('Not connected to RPC server.', TransportErrorCode.ConnectionError);
            }
            try {
                const response = yield fetch(`http://localhost:${this.port}/rpc`, {
                    method: 'POST',
                    body: JSON.stringify({
                        method,
                        params,
                    }),
                });
                if (response.ok) {
                    return yield response.json();
                }
            }
            catch (error) {
                if (error instanceof TypeError) {
                    if (error.message === 'Failed to fetch') {
                        this.port = -1;
                        throw new TransportError('Could not connect to RPC server.', TransportErrorCode.ConnectionError);
                    }
                }
                console.warn('Could not send RPC request.', error);
                throw new TransportError('Could not send RPC request.', TransportErrorCode.InternalError);
            }
        });
    }
}
