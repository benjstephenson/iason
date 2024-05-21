import * as AST from "./AST"
import { Codec } from "./Codec"
import { CodecFor, EncodableObject, GetInput, GetOutput, GetSourceType, GetTargetType, Simplify } from "./types"

export const date = Codec.make<Date, string>(AST.DateKind)
export const number = Codec.make<number, number>(AST.NumberKind)
export const string = Codec.make<string, string>(AST.StringKind)
export const boolean = Codec.make<boolean, boolean>(AST.BooleanKind)
export const forNull = Codec.make<null, null>(AST.NullKind)
export const array = <C extends Codec<any, any>>(codec: C) => Codec.make<GetInput<C>[], GetOutput<C>[]>(AST.IterableKind(codec.ast))
export const forClass = <T extends new (...args: any[]) => any, Out>(def: T, encode: (c: InstanceType<T>) => Out) => Codec.make<InstanceType<T>, Out>(AST.ClassKind(encode))

export const object = <In extends EncodableObject>(
    source: In
): Codec<Simplify<GetSourceType<In>>, Simplify<GetTargetType<In>>> => {
    const fields = Object.keys(source).map(k => AST.ObjectField(k, source[k].ast))

    return Codec.make(AST.ObjectKind(fields))
}

export const forType =
    <In extends Record<string, any>>() =>
        <Desc extends CodecFor<In>>(desc: Desc): Codec<In, Simplify<GetTargetType<Desc>>> => {
            const fields = Object.keys(desc).map(k => AST.ObjectField(k, desc[k].ast))
            return Codec.make(AST.ObjectKind(fields))
        }

export const transform = <In1, Out1, Out2>(
    source: Codec<In1, Out1>,
    f: (source: Out1) => Out2
): Codec<In1, Out2> => {
    return Codec.make(AST.Transform(source.ast, f))
}
