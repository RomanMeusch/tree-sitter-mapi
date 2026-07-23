# tree-sitter-mapi

Tree-sitter grammar for the mapi IDL — the Rust-flavored API definition
language used in JobBoard2 (`*.mapi`).

Written from scratch rather than forked from tree-sitter-rust: mapi is far
smaller than Rust and diverges from it in ways that break Rust parsers:

- field defaults: `archive_at: u64 = 0`
- union return types: `fn get(id: Id) -> Entity<Job> | NotFound | BadRequest(ErrorResp)`
- `interface` blocks of `fn` signatures
- range attribute arguments: `#[range(1..=5)]`

## Development

```sh
tree-sitter generate   # after editing grammar.js
tree-sitter test       # corpus tests in test/corpus/
tree-sitter parse ../mapi/ScaleUnit.mapi   # the real spec files are the acceptance test
```

The generated `src/` is committed on purpose: Zed (and other consumers)
compile `src/parser.c` directly and do not run `tree-sitter generate`.

Editor integration lives in the sibling `zed-mapi` extension.
