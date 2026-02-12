# FenwickTreeLibrary

This library implements a 0-indexed Fenwick Tree for tracking cumulative values over a dynamic array. It is suitable for systems where frequent prefix sum queries and point updates are required, such as time based accounting, queuing systems, or share tracking.

## Design Characteristics

- O(log n) complexity for both updates and prefix sum queries.
- Storage efficient using a `mapping(uint256 => int256)` instead of an array.
- Only supports lengths that are exact powers of two (`2^k`), which simplifies internal logic and allows future extensions via `extend()`.

## Invariants and Constraints

- The tree must be initialized with a power of two length greater than 0 via `initialize(...)`.
- Index bounds are enforced. Access beyond the current capacity reverts with `IndexOutOfBounds()`.
- To support dynamic resizing, `extend()` can double the current tree length (up to a safe limit).
- Use of negative values is supported in `modify(...)`, allowing decrement operations.

## Data Structures

```solidity
struct Tree {
    mapping(uint256 index => int256) _values; // Internal Fenwick Tree nodes.
    uint256 _length;                          // Capacity of the tree (must be power of two).
}
```

## Functions

### `initialize(Tree storage tree, uint256 length_)`

Initializes the tree with the specified length.

- Reverts with `InvalidLength()` if `length_ == 0` or not a power of two.
- Only callable once. Re-initialization is not allowed.

### `length(Tree storage tree) -> uint256`

Returns the current capacity of the tree.

### `extend(Tree storage tree)`

Doubles the tree's capacity.

- Preserves prefix sum structure.
- Reverts with `InvalidLength()` on overflow.

### `modify(Tree storage tree, uint256 index, int256 value)`

Increments or decrements the value at a given index by `value`.

- Performs `tree[index] += value`.
- Reverts if index is out of bounds.
- No-op if `value == 0`.

### `get(Tree storage tree, uint256 index) -> int256`

Returns the prefix sum for the range `[0, index]`.

- If `index >= length`, it is clamped to `length - 1`.

### `get(Tree storage tree, uint256 from, uint256 to) -> int256`

Returns the sum over the range `[from, to]` (inclusive).

- Returns `0` if `from > to`.

## Internals

### `_modify(...)`

Low level implementation of Fenwick update using bitwise operations. It updates `tree[index]` and propagates changes upward via `index |= index + 1`.

### `_get(...)`

Assembly optimized prefix sum computation. It aggregates values by descending via `index := and(index, index + 1) - 1`.

## References

- [CP Algorithms: Fenwick Tree](https://cp-algorithms.com/data_structures/fenwick.html)
- [Wikipedia: Binary Indexed Tree](https://en.wikipedia.org/wiki/Fenwick_tree)
