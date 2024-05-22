import * as AST from "./AST"
import { Codec } from "./Codec"
import { GetInput, GetOutput } from "./types"

export type NamespaceMap = {
    [x: string]: string
}

const defaultMap: NamespaceMap = {
    "http://www.w3.org/2006/time#": "owl:time",
    "https://www.schema.org": "sch:org"
}

const UnreachableCase = (a: never) => {
    throw new Error(`Unhandled AST element: ${JSON.stringify(a)}`)
}

export const toJsonLd = <C extends Codec<any, any>>(
    codec: C,
    opts?: { context?: string | object; curies?: boolean; namespace?: NamespaceMap }
): ((o: GetInput<C>) => GetOutput<C>) => {
    const options = {
        curies: false,
        namespace: defaultMap,
        ...opts
    }

    const ourContext = {}

    const work = (ast: AST.AST): ((input: unknown, fieldName?: string) => any) => {
        switch (ast._type) {
            case "boolean-kind":
            case "number-kind":
            case "string-kind":
            case "null-kind":
                return (input: boolean | number | string, _: string) => input
            case "class-kind":
                return ast.encode
            case "object-kind": {
                return (input: object, _: string) => {
                    const schemaKeys = ast.fields.map(_ => [_.key, _.ast] as const)

                    const out = {}
                    for (const [fieldName, propertyAst] of schemaKeys) {
                        out[fieldName] = work(propertyAst)(input[fieldName], fieldName)
                    }
                    return out
                }
            }
            case "date-kind":
                return (input: Date, fieldName: string) => {
                    ourContext[fieldName] = "http://www.w3.org/2006/time#Instant"
                    return input.toISOString()
                }

            case "transform":
                return (input: any, field) => ast.encode(work(ast.source)(input, field))

            case "iterable-kind":
                return (input: any, _) => {
                    if (!Array.isArray(input)) throw new Error(`Expected an array but got ${typeof input}`)

                    const out: any[] = []
                    for (const item of input) {
                        const encoded = work(ast.ast)(item)
                        out.push(encoded)
                    }
                    return out
                }

            case "passthrough":
                return (input, _) => input

            default:
                return UnreachableCase(ast)
        }
    }

    return input => {
        const result = work(codec.ast)(input)

        const applyContext = (out: object) => {
            if (options?.context) {
                if (typeof options.context == "string") {
                    return {
                        "@context": options.context,
                        ...result
                    }
                } else
                    return {
                        "@context": ourContext,
                        data: result
                    }
            }

            return out
        }

        return applyContext(result)
    }
}
