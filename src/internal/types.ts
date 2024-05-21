import { Codec } from "./Codec"

export type Simplify<A> = { [K in keyof A]: A[K] } extends infer B ? B : never


export type EncodableObject = Record<string, Codec<any, any>>
export type CodecFor<In extends Record<string, any>> = { [k in keyof In]: Codec<In[k], any> }
export type GetSourceType<In extends EncodableObject> = {
    [k in keyof In]: In[k] extends Codec<infer _in, any> ? _in : never
}
export type GetTargetType<In extends EncodableObject> = {
    [k in keyof In]: In[k] extends Codec<any, infer _out> ? _out : never
}

export type GetInput<C extends Codec<any, any>> = C extends Codec<infer _in, any> ? _in : never
export type GetOutput<C extends Codec<any, any>> = C extends Codec<any, infer _out> ? _out : never
