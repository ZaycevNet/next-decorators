import {NextApiRequest, NextApiResponse} from 'next';
import Ajv from 'ajv';

export const ajv = new Ajv({
    allErrors: true,
    nullable: true,
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
});

export type RequestError<T extends Error = Error> = Error & BaseError & MethodNotAllowedError & BadRequestError & ServerInternalError & T;
export type Request<T = {}> = NextApiRequest & T;
export type Response<T = {}> = NextApiResponse & T;

export class BaseError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);

        this.name = 'BaseError';
        this.statusCode = 500;
        this.message = message;
    }
}

export class MethodNotAllowedError extends BaseError {
    constructor(message: string = 'Method not allowed') {
        super(message);

        this.name = 'MethodNotAllowedError';
        this.message = message;
        this.statusCode = 405;
    }
}

export class BadRequestError extends BaseError {
    errors: any;
    constructor(message: string = 'Bad Request', errors: any) {
        super(message);

        this.name = 'BadRequestError';
        this.message = message;
        this.errors = errors;
        this.statusCode = 400;
    }
}

export class ServerInternalError extends BaseError {
    addition: any;
    constructor(message: string = 'Server Internal Error', ...addition: any[]) {
        super(message);

        this.name = 'ServerInternalError';
        this.message = message;
        this.addition = addition;
        this.statusCode = 500;
    }
}

export const ErrorHandler = () => (t: any, p: string, d: PropertyDescriptor) => {
    const handler = d.value;

    t.constructor.errorHandler = async (error: RequestError, req: Request, res: Response) => {
        res.status(error.statusCode ? error.statusCode : 500);

        const response = await handler(error, req, res);

        return res.json(response);
    };
};

export const Request = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request, res: Response) => {
            try {
                const response = await handler(req, res);
                return res.json(response);
            } catch (e) {
                return await t.constructor.errorHandler(e, res, res);
            }
        }
    };
};

export const All = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request, res: Response) => {
            return await handler(req, res);
        }
    };
};

export const Get = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request<{method: string}>, res: Response) => {
            if(req.method !== 'GET')
                throw new MethodNotAllowedError();

            return await handler(req, res);
        }
    };
};

export const Post = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request<{method: string}>, res: Response) => {
            if(req.method !== 'POST')
                throw new MethodNotAllowedError();

            return await handler(req, res);
        }
    };
};

export const Delete = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request<{method: string}>, res: Response) => {
            if(req.method !== 'DELETE')
                throw new MethodNotAllowedError();

            return await handler(req, res);
        }
    };
};

export const Head = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request<{method: string}>, res: Response) => {
            if(req.method !== 'HEAD')
                throw new MethodNotAllowedError();

            return await handler(req, res);
        }
    };
};

export const Options = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request<{method: string}>, res: Response) => {
            if(req.method !== 'OPTIONS')
                throw new MethodNotAllowedError();

            return await handler(req, res);
        }
    };
};

export const Put = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request<{method: string}>, res: Response) => {
            if(req.method !== 'PUT')
                throw new MethodNotAllowedError();

            return await handler(req, res);
        }
    };
};

export const Patch = () => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request<{method: string}>, res: Response) => {
            if(req.method !== 'PATCH')
                throw new MethodNotAllowedError();

            return await handler(req, res);
        }
    };
};

export const Middleware = (middleware: (req: Request, res: Response) => (Promise<void> | void)) => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request, res: Response) => {
            await middleware(req, res);

            return await handler(req, res);
        }
    };
};

export const ExpressMiddleware = (middleware: (req: Request, res: Response, next: Function) => (Promise<void> | void)) => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request, res: Response) => {
            const response = await new Promise(resolve => middleware(req, res, resolve));

            if(response instanceof Error)
                throw response;

            return await handler(req, res);
        }
    };
};

export const QuerySchema = (schema: object, customAjv: any = ajv) => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request, res: Response) => {
            const validate = customAjv.compile(schema)(req.query);

            if(!validate)
                throw new BadRequestError('Bad Request', customAjv.errors);

            return await handler(req, res);
        }
    };
};

export const BodySchema = (schema: object, customAjv: any = ajv) => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request, res: Response) => {
            const validate = customAjv.compile(schema)(req.body);

            if(!validate)
                throw new BadRequestError('Bad Request', customAjv.errors);

            return await handler(req, res);
        }
    };
};

export const ResponseSchema = (schema: object, customAjv: any = ajv) => (t: any, p: string, d: PropertyDescriptor): PropertyDescriptor => {
    const handler = d.value;

    return {
        ...d,
        value: async (req: Request, res: Response) => {
            const response: any = await handler(req, res);

            const validate = customAjv.compile(schema)(response);

            if(!validate)
                throw new ServerInternalError('Server Internal Error', customAjv.errors);

            return response;
        }
    };
};