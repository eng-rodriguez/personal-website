# Domain

## Ubiquitous language
Record substantive domain terms and their code names. Preserve established language; this glossary is optional for work without business-domain concepts.

| Term | Meaning | Context | Code name |
| --- | --- | --- | --- |
| <Order> | <A customer's request to buy one or more items> | <orders> | `orders.Order` |

## Bounded contexts
| Context (owning modules/apps) | Type | Owns | Upstream of | Downstream of |
| --- | --- | --- | --- | --- |
| <orders> | core \| supporting \| generic | <aggregates> | <contexts> | <contexts> |

## Context map
<How contexts integrate: service calls, events (with event names), shared kernel, anti-corruption layers.>

## Invariants
- <Aggregate>: <rule that must always hold>
