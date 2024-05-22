export interface StringKind {
    readonly _type: "string-kind"
}

export const StringKind: StringKind = {
    _type: "string-kind"
}

export interface BooleanKind {
    readonly _type: "boolean-kind"
}

export const BooleanKind: BooleanKind = {
    _type: "boolean-kind"
}

export interface NumberKind {
    readonly _type: "number-kind"
}

export const NumberKind: NumberKind = {
    _type: "number-kind"
}

export interface NullKind {
    readonly _type: "null-kind"
}

export const NullKind: NullKind = {
    _type: "null-kind"
}

export interface DateKind {
    readonly _type: "date-kind"
}

export const DateKind: DateKind = {
    _type: "date-kind"
}

export interface IterableKind {
    readonly _type: "iterable-kind"
    readonly ast: AST
}

export const IterableKind = (ast: AST): IterableKind => ({ _type: "iterable-kind", ast })

export interface ObjectKind {
    readonly _type: "object-kind"
    readonly fields: ObjectField[]
}

export const ObjectKind = (fields: ObjectField[]): ObjectKind => ({
    _type: "object-kind",
    fields
})

export interface ObjectField {
    readonly _type: "object-field"
    readonly key: string // | symbol | ....
    readonly ast: AST
}

export const ObjectField = (key: string, ast: AST): ObjectField => ({
    _type: "object-field",
    key,
    ast
})

export interface Transform {
    readonly _type: "transform"
    readonly source: AST
    readonly encode: (source: any) => any
}

export const Transform = (source: AST, encode: (source: any) => any): Transform => ({
    _type: "transform",
    source,
    encode
})

export interface ClassKind {
    readonly _type: "class-kind"
    readonly encode: (source: any) => any
}

export const ClassKind = <T extends new (...args: any[]) => any>(encode: (c: InstanceType<T>) => any): ClassKind => ({
    _type: "class-kind",
    encode
})

export interface PassThrough {
    readonly _type: "passthrough"
}

export const PassThrough: PassThrough = { _type: "passthrough" }

export type AST =
    | DateKind
    | StringKind
    | BooleanKind
    | NumberKind
    | NullKind
    | IterableKind
    | ObjectKind
    | ClassKind
    | Transform
    | PassThrough
