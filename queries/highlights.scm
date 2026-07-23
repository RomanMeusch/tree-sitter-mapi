(doc_comment) @comment.doc
(line_comment) @comment

[
  "const"
  "type"
  "struct"
  "enum"
  "interface"
  "fn"
] @keyword

(string) @string
(integer) @number
(boolean) @boolean

; Type definitions and references
(struct_item name: (identifier) @type)
(enum_item name: (identifier) @type)
(type_item name: (identifier) @type)
(interface_item name: (identifier) @type)
(type_parameters (identifier) @type)
(type name: (path (identifier) @type))

; Builtin scalar types
(type
  name: (path (identifier) @type.builtin)
  (#match? @type.builtin "^(u8|u16|u32|u64|i8|i16|i32|i64|f32|f64|bool|String|Bytes)$"))

(const_item name: (identifier) @constant)
(function_item name: (identifier) @function)
(parameter name: (identifier) @variable.parameter)
(field name: (identifier) @property)
(field_initializer name: (identifier) @property)
(variant name: (identifier) @constructor)

; Expression paths: `Scope::Host(...)`, `Auth::OAuth2 { ... }`
(call_expression function: (path (identifier) @constructor))
(struct_expression name: (path (identifier) @constructor))

; SCREAMING_CASE identifiers are scope/auth constants (TENANT, OAUTH)
((identifier) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]{2,}$"))

; Attributes
(attribute ["#[" "]"] @attribute)
(inner_attribute ["#![" "]"] @attribute)
(meta name: (path (identifier) @attribute))
(meta_assignment key: (identifier) @attribute)

[
  "->"
  "|"
  "="
  "..="
  "::"
] @operator

[":" ";" ","] @punctuation.delimiter

["(" ")" "[" "]" "{" "}" "<" ">"] @punctuation.bracket
