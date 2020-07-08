## NextJS Decorators for API

A simple set of decorators for NextJS so you don't have to write a lot of code yourself

### Decorators

List of all decorators in lib

___

####_Main required decorators_

`@Req()` - ***required***, makes it clear that this is not anyhow what function

`@ErrorHandler()` - ***required***, install an exception handler to your controller

___

####_Request types_

`@All()` - allow ***all*** types of incoming requests

`@Get()` - allow incoming requests with type ***GET*** only

`@Post()` - allow incoming requests with type ***POST*** only

`@Delete()` - allow incoming requests with type ***DELETE*** only

`@Head()` - allow incoming requests with type ***HEAD*** only

`@Options()` - allow incoming requests with type ***OPTIONS*** only

`@Put()` - allow incoming requests with type ***PUT*** only

`@Patch()` - allow incoming requests with type ***PATCH*** only

___

####_Middlewares_

`@Middleware((req: Request, res: Response) => Promise<void> | void)` - normal middleware, pass a function to it that takes two ***request*** and ***response*** parameters and returns nothing, it can be a regular function or asynchronous, you can throw exceptions in your function

`@ExpressMiddleware((req: Request, res: Response, next: Function) => Promise<void> | void)` - Express similar to middleware, takes in another parameter ***next, the function that it should perform***

___

####_Validation_

Validation decorators can take two parameters, a scheme and a custom Ajv instance (***optional***)

`@QuerySchema(schema, Ajv?)`

`@BodySchema(schema, Ajv?)`

`@ResponseSchema(schema, Ajv?)`


### How to use

First you need to import everything you need

Below I’ll just show what you can get from there


Errors

```typescript
import {BaseError, MethodNotAllowedError, BadRequestError, ServerInternalError} from '@za-utils/next-decorators';
```

Types `RequestError` is generic type `RequestError<T extents Error = Error> = BaseError & T;`

```typescript
import {RequestError} from '@za-utils/next-decorators';
```

Types `Request` & `Response` is generic type `Request<T = any> = NextApiRequest & T` & `Response<T = any> = NextApiResponse & T;`

```typescript
import {Request, Response} from '@za-utils/next-decorators';
```

Required decorators

```typescript
import {ErrorHandler, Req} from '@za-utils/next-decorators';
```

Method decorators

```typescript
import {All, Get, Post, Delete, Head, Options, Put, Patch} from '@za-utils/next-decorators';
```

Middleware

```typescript
import {Middleware, ExpressMiddleware} from '@za-utils/next-decorators';
```

Validators

```typescript
import {QuerySchema, BodySchema, ResponseSchema} from '@za-utils/next-decorators';
```

_Note that **ResponseSchema**, unlike **QuerySchema** and **BodySchema**, throws a **Server Internal Error**_


### Sample controller

`Controller.ts`

```typescript
import {Req, Get, Post, Middleware, ErrorHandler, RequestError, Request, Response} from '@za-utils/next-decorators'; import {BodySchema} from "./index";

export class MyRoutesController {
    @Req()
    @Get()
    someGetRoute(req: Request, res: Response){
        console.log('no need to use req.send, req.json, req.end');

        return {
            some: 'answer'
        };
    }

    @Req()
    @Get()
    async asyncHandler(req: Request, res: Response){
        return {
            some: 'answer'
        };
    }

    @Req()
    @Get()
    @Middleware((req: Request, res: Response) => {
        if(!req.cookies)
            throw new Error('my custom error');
    })
    async middlewareHandler(req: Request, res: Response){
        console.log('this code will not start');

        return {
            some: 'answer'
        };
    }

    @Req()
    @Post()
    @BodySchema({
        type: 'object',
        properties: {
            some: {
                type: 'string'
            }   
        }
    })
    async middlewareHandler(req: Request, res: Response){
        return {
            ok: true,
            body: req.body
        };
    }

    @ErrorHandler()
    errorHandler(error: RequestError, req: Request, res: Response){
        console.log('im catch error', error);
    
        return {
            message: 'Sorry, its a error'
        };
    }
}
```

`./pages/api/test.ts`

```typescript
import {MyRoutesController} from '../../Controller.ts';

const controller = new MyRoutesController();

export default controller.someGetRoute;
```

## Ok, good

My web site: https://zaycev.dev/

(if it doesn’t work, then I haven’t finished everything yet, check back tomorrow)

Thanks for your attention

___

_Alex Zaycev_