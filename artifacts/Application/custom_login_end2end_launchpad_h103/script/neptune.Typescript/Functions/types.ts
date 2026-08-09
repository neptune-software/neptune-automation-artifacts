declare const msal: any;

type Success<T> = {
    data: T;
    error: null;
};

type Failure<E> = {
    data: null;
    error: E;
};

type ResultOrError<T, E = Error> = Success<T> | Failure<E>;
type RequestError = { status?: number; responseJSON?: { status?: string } };

async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<ResultOrError<T, E>> {
    try {
        const data = await promise;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as E };
    }
}

function tryCatchSync<T, E = Error & {}>(fn: () => T): ResultOrError<T, E> {
    try {
        const data = fn();
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as E };
    }
}