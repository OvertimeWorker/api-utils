import type { DMMF, TypeMapDef, Args } from "@prisma/client/runtime/client"
import type { Prettify } from "./helper.types.js"
import type { Prisma } from "@prisma/client/extension"

type ModelName<T extends TypeMapDef> = keyof T["model"]

type ModelsWithCodeField<T extends TypeMapDef> = {
  [M in ModelName<T>]: "code" extends keyof T["model"][M]["payload"]["scalars"] ? M : never
}[ModelName<T>]

type CreateData<
  T extends TypeMapDef,
  M extends ModelName<T>,
> = T["model"][M]["operations"]["create"]["args"]["data"]

type PrefixOptions<T extends TypeMapDef> = Partial<{
  [M in ModelsWithCodeField<T>]: (nextId: number, args: CreateData<T, M>) => string
}>

interface RawExecutable {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>
}

type ProcessedDMMFModels = Record<
  string,
  Prettify<
    Omit<DMMF.Model, "fields"> & {
      fields: Record<string, DMMF.Field>
      idFields: string[]
    }
  >
>

type SelectAndInclude = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  include: any
}

type SelectAndOmit = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  omit: any
}

type SelectSubset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never
} & (T extends SelectAndInclude
  ? "Please either choose `select` or `include`."
  : T extends SelectAndOmit
    ? "Please either choose `select` or `omit`."
    : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {})

type AutoCodeModels<
  TypeMap extends TypeMapDef,
  CodeOptionsKey extends string,
> = Uncapitalize<CodeOptionsKey> & TypeMap["meta"]["modelProps"]

type SmartMakeOptional<
  K,
  TArgs,
  TypeMap extends TypeMapDef,
  CodeOptionsKey extends string,
> = TArgs extends { data: infer D }
  ? Omit<TArgs, "data"> & {
      data: Omit<
        D,
        ("pid" & keyof D) | (K extends AutoCodeModels<TypeMap, CodeOptionsKey> ? "code" : never)
      > & {
        // Make 'pid' optional ONLY if it exists in the schema
        [P in Extract<keyof D, "pid">]?: D[P]
      } & {
        // Make 'code' optional ONLY if the model is in CODE_OPTIONS
        [P in Extract<
          "code",
          K extends AutoCodeModels<TypeMap, CodeOptionsKey> ? "code" : never
        >]?: string
      }
    }
  : TArgs

type ExtendedDB<TypeMap extends TypeMapDef, ExtendedClient, CodeOptionsKey extends string> = {
  [K in TypeMap["meta"]["modelProps"]]: Omit<ExtendedClient[K], "create"> & {
    create: <
      T extends SmartMakeOptional<K, Args<ExtendedClient[K], "create">, TypeMap, CodeOptionsKey>,
    >(
      args: SelectSubset<
        T,
        SmartMakeOptional<K, Args<ExtendedClient[K], "create">, TypeMap, CodeOptionsKey>
      >,
    ) => Promise<Prisma.Result<ExtendedClient[K], T, "create">>
  }
} & Omit<ExtendedClient, TypeMap["meta"]["modelProps"]>

export type { PrefixOptions, RawExecutable, ProcessedDMMFModels, ExtendedDB }
