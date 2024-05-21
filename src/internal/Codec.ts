import * as AST from "./AST"

export class Codec<in out In, in out Out = In> {
    private constructor(readonly ast: AST.AST) {
    }

    static make<In, Out>(ast: AST.AST): Codec<In, Out> {
        return new Codec(ast)
    }

    with<Out2>(f: (self: Codec<In, Out>) => Codec<In, Out2>) {
        return f(this)
    }
}