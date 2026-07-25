# tree-sitter-mapi

Tree-sitter grammar for the mapi IDL — a Rust-flavored API definition
language (`*.mapi`).

mapi looks like Rust but is not a Rust subset, which is why Rust parsers
choke on it and this grammar is written from scratch:

- field defaults: `archive_at: u64 = 0`
- union return types: `fn get(id: Id) -> Entity<Job> | NotFound | BadRequest(ErrorResp)`
- `interface` blocks of `fn` signatures
- range attribute arguments: `#[range(1..=5)]`

## Development

```sh
tree-sitter generate   # after editing grammar.js
tree-sitter test       # corpus tests in test/corpus/
tree-sitter parse path/to/file.mapi
```

The generated `src/` is committed on purpose: consumers such as Zed
compile `src/parser.c` directly and do not run `tree-sitter generate`.

Highlight queries live in `queries/highlights.scm`.
