# VTEX IO Challenge — Shipping Estimate Badge

Este repositorio simula un app real de **VTEX IO** que muestra, en la página de producto (PDP), un **estimado de entrega**: días hábiles, transportadora y costo de envío para el producto que se está viendo.

El app tiene tres capas:

- **Store** (`store/`): declaración de bloques e interfaces.
- **React** (`react/`): el componente `ShippingEstimateBadge`, que lee el producto del `product-context` y consulta una query GraphQL.
- **GraphQL + Node** (`graphql/`, `node/`): el schema, la query y un resolver que llama a un servicio externo de cotización de envíos (simulado), además de un endpoint REST de health check.

El código contiene **errores intencionales y secciones incompletas**, marcadas en comentarios con la etiqueta `TODO #N` (del 1 al 10). Algunos puntos se resuelven con una línea; otros admiten varias soluciones válidas y requieren que tomes y justifiques decisiones de diseño.

## Tu tarea

Resuelve **todas las tareas que puedas**. Están agrupadas por capa del app, no por orden de importancia, así que puedes abordarlas en el orden que prefieras. Si alguna no te alcanza el tiempo para implementarla, explica en `RESPUESTAS.md` cómo la resolverías: eso también se evalúa.

### Store

1. Corregir el error de sintaxis JSONC en `store/blocks.jsonc` que impide compilar la store.
2. Completar la interface faltante en `store/interfaces.jsonc` para el bloque `shipping-estimate-badge`.

### Componente React

3. Corregir el tipado de la prop `showCarrierName` (debe ser opcional, con valor por defecto).
4. Corregir el acceso a `product.productId` para que no falle si `product` es `null`/`undefined`.
5. Resolver `defaultPostalCode` desde el contexto de la tienda en vez de un valor hardcodeado.
6. Agregar manejo explícito de `loading` y `error` antes de leer `data.estimateShipping`.
7. Proponer (e idealmente implementar) la optimización de renders señalada en el componente.

### GraphQL y Node

8. Agregar `productId` y `postalCode` como argumentos en `graphql/schema.graphql` y actualizar la firma del resolver.
9. Implementar el resolver completo en `node/resolvers/estimateShipping.ts`: timeout, manejo de errores, fallback y una estrategia de caching justificada.
10. Corregir `node/middlewares/health.ts` para devolver el status code correcto (200/503) y un body JSON válido.

## Estructura del repo

```
.
├── manifest.json                      # Manifiesto del app VTEX IO
├── store/
│   ├── blocks.jsonc                   # Bloques
│   └── interfaces.jsonc               # Interfaces
├── react/
│   ├── ShippingEstimateBadge.tsx      # Entry point del componente
│   ├── components/
│   │   └── ShippingEstimateBadge.tsx  # Componente principal
│   └── typings/global.d.ts
├── graphql/
│   ├── schema.graphql                 # Schema GraphQL
│   └── estimateShipping.graphql       # Query usada por el front
├── node/
│   ├── index.ts                       # Definición del Service
│   ├── service.json
│   ├── clients/index.ts               # Client hacia el servicio externo simulado
│   ├── resolvers/estimateShipping.ts  # Resolver
│   └── middlewares/health.ts          # Health check REST
└── RESPUESTAS.md                      # Plantilla para tus explicaciones
```

## El servicio externo

`node/clients/index.ts` define `ShippingMockClient`, que consulta un servicio de cotizaciones **simulado** (`shipping-mock.example.com`). No existe un servidor real detrás: asume que se comporta como se documenta en el client (puede tardar, fallar o devolver una lista vacía) y diseña tu código en consecuencia.

## ¿Necesito una cuenta VTEX?

No. La evaluación se hace revisando tu código y tu archivo `RESPUESTAS.md`. Si tienes acceso a una cuenta y workspace de VTEX IO puedes probar con `vtex link`, pero no es un requisito. Puedes instalar dependencias en `react/` y `node/` (`yarn` o `npm install`) para tener tipado en tu editor.

## Qué debes entregar

1. **El código corregido**: el repo completo (zip o enlace a un repositorio) o un diff/patch contra este starter.
2. **`RESPUESTAS.md`** completado, explicando brevemente las decisiones que tomaste, en especial en manejo de errores, caching y optimización de renders.

Evaluamos tanto el código como el razonamiento. Una decisión bien justificada vale más que una implementación sobredimensionada. Si algo no te dio tiempo de implementarlo, explica en `RESPUESTAS.md` cómo lo harías.

## Reglas

- No modifiques los comentarios `TODO` para ocultarlos; puedes eliminarlos una vez resuelto el punto o dejarlos con una nota.
- Puedes agregar archivos, dependencias o tests si los consideras necesarios; justifícalo en `RESPUESTAS.md`.
- Puedes consultar documentación pública (VTEX Developer Portal, React, Apollo, etc.).
