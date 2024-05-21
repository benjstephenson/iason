import { Codec } from "./Codec"
import { Simplify } from "./types"
import { transform } from "./Codecs"

const addField =
    <F extends string, Field extends Record<F, string> = Record<F, string>>(field: F): {
        <In extends Record<string, any | Codec<any, any>>, Out>(value: string): (self: Codec<In, Out>) => Codec<In, Simplify<Out & Field>>,
        <In extends Record<string, any | Codec<any, any>>, Out>(from: (obj: Out) => string): (self: Codec<In, Out>) => Codec<In, Simplify<Out & Field>>
    } =>
        <In extends Record<string, any | Codec<any, any>>, Out>(value: (string | ((obj: Out) => string))) =>
            (self: Codec<In, Out>): Codec<In, Simplify<Out & Field>> => {
                return transform<In, Out, Simplify<Out & Field>>(
                    self,
                    e => ({ ...e, [field]: typeof value === 'function' ? value(e) : value }) as any
                )
            }

export const atType = addField("@type")
export const atId = addField("@id")
