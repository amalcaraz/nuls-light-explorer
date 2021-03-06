declare module 'express-jsonschema' {

  export function validate(...args: any[]): (...args: any[]) => any;

  interface JsonSchemaValidation {
    value: any;
    property: string;
    messages: string[];
  }

  export interface JsonSchemaError extends Error {
    validations: {
      body: JsonSchemaValidation[];
    }
  }

}


declare module 'es6-promise-pool' {
  const PromisePool: any;
  export = PromisePool;
}


declare module 'multilevel' {
  const any: any;
  export = any;
}

declare module 'multilevel/msgpack' {
  const any: any;
  export = any;
}