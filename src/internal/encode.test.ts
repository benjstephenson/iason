import * as A from "./Codecs"
import * as R from "./Rdf"
import { toJsonLd } from "./Encode"
import { assertThat } from "mismatched"

describe("Encoding", () => {
    class MyName {
        constructor(public readonly name: string) {}
    }

    const person = {
        name: "Bob",
        dob: new Date(),
        address: {
            id: "abc",
            lines: {
                one: "123 Test Street"
            },
            type: "home"
        }
    }

    const forType = A.forType<typeof person>()({
        name: A.string,
        dob: A.date,
        address: A.object({
            id: A.string,
            lines: A.object({ one: A.string }),
            type: A.string
        })
    })

    it("primitives", () => {
        assertThat(toJsonLd(A.string)("hello")).is("hello")
        assertThat(toJsonLd(A.boolean)(true)).is(true)
        assertThat(toJsonLd(A.boolean)(false)).is(false)
        assertThat(toJsonLd(A.forNull)(null)).is(null)
        const now = new Date(Date.now())
        assertThat(toJsonLd(A.date)(now)).is(now.toISOString())
    })

    it("custom class", () => {


        const codec = A.forClass(MyName, a => a.name)
        assertThat(toJsonLd(codec)(new MyName("Ada Lovelace"))).is("Ada Lovelace")
    })

    it("arrays", () => {
        assertThat(toJsonLd(A.array(A.string))(["hello", "world"])).is(["hello", "world"])

        const codec = A.array(forType)
        const jsonLd = toJsonLd(codec)([person, person])
        assertThat(jsonLd).is([
            {
                name: "Bob", dob: person.dob.toISOString(),
                address: {
                    id: "abc",
                    lines: { one: "123 Test Street" },
                    type: "home"
                }
            },
            {
                name: "Bob", dob: person.dob.toISOString(),
                address: {
                    id: "abc",
                    lines: { one: "123 Test Street" },
                    type: "home"
                }
            }
        ])
    })
    it("forType generates the same AST as object", () => {
        const forType = A.forType<typeof person>()({
            name: A.string,
            dob: A.date,
            address: A.object({
                id: A.string,
                lines: A.object({ one: A.string }),
                type: A.string
            })
        })

        const obj = A.object({
            name: A.string,
            dob: A.date,
            address: A.object({
                id: A.string,
                lines: A.object({ one: A.string }),
                type: A.string
            })
        })

        assertThat(forType.ast).is(obj.ast)
    })

    it("an object", () => {
        type PersonWithNumbers = Omit<typeof person, "name"> & { name: MyName, phone: string[] }
        const a = A.forType<PersonWithNumbers>()({
            name: A.forClass(MyName, n => n.name),
            dob: A.date,
            phone: A.array(A.string),
            address: A.object({
                id: A.string,
                lines: A.object({ one: A.string }),
                type: A.string
            })
                .with(R.atType("https://www.schema.org/PostalAddress"))
                .with(R.atId("foo"))
        })
            .with(R.atType("https://www.schema.org/Person"))
            .with(R.atId(p => `https://www.schema.org/${encodeURI(p.name)}` ))

        assertThat(toJsonLd(a)({
            ...person,
            name: new MyName("Bob Bobbington"),
            phone: [
                "07707717711", "0220382193"
            ]
        })).is({
            name: "Bob Bobbington",
            phone: [
                "07707717711", "0220382193"
            ],
            dob: person.dob.toISOString(),
            address: {
                id: "abc",
                lines: { one: "123 Test Street" },
                type: "home",
                "@type": "https://www.schema.org/PostalAddress",
                "@id": "foo"
            },
            "@type": "https://www.schema.org/Person",
            "@id": "https://www.schema.org/Bob%20Bobbington",
        })
    })

})
