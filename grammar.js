/**
 * @file Tree-sitter grammar for the mapi IDL
 *
 * mapi is a Rust-flavored API definition language: struct/enum/const/type
 * items plus `interface` blocks of `fn` signatures. It diverges from Rust
 * with field defaults (`archive_at: u64 = 0`), union return types
 * (`Ok | BadRequest(ErrorResp)`), and range attribute arguments (`1..=5`).
 */

const sepBy1 = (sep, rule) => seq(rule, repeat(seq(sep, rule)));
const commaSep = (rule) => optional(seq(sepBy1(',', rule), optional(',')));

module.exports = grammar({
  name: 'mapi',

  extras: ($) => [/\s/, $.doc_comment, $.line_comment],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat(choice($.inner_attribute, $.item)),

    item: ($) =>
      seq(
        repeat($.attribute),
        choice(
          $.const_item,
          $.type_item,
          $.struct_item,
          $.enum_item,
          $.interface_item,
        ),
      ),

    // --- Attributes ---------------------------------------------------

    inner_attribute: ($) => seq('#![', $.meta, ']'),
    attribute: ($) => seq('#[', $.meta, ']'),

    meta: ($) =>
      seq(
        field('name', $.path),
        optional(seq('(', commaSep($._meta_arg), ')')),
      ),

    _meta_arg: ($) => choice($._literal, $.range, $.meta_assignment, $.meta),

    meta_assignment: ($) =>
      seq(
        field('key', $.identifier),
        '=',
        field('value', choice($._literal, $.path)),
      ),

    range: ($) => seq($.integer, '..=', $.integer),

    // --- Items --------------------------------------------------------

    const_item: ($) =>
      seq(
        'const',
        field('name', $.identifier),
        ':',
        field('type', $.type),
        '=',
        field('value', $._expression),
        ';',
      ),

    type_item: ($) =>
      seq('type', field('name', $.identifier), '=', field('type', $.type), ';'),

    struct_item: ($) =>
      seq(
        'struct',
        field('name', $.identifier),
        optional($.type_parameters),
        choice(
          seq($.tuple_fields, ';'),
          $.field_block,
          ';',
        ),
      ),

    enum_item: ($) =>
      seq(
        'enum',
        field('name', $.identifier),
        optional($.type_parameters),
        '{',
        commaSep($.variant),
        '}',
      ),

    interface_item: ($) =>
      seq(
        'interface',
        field('name', $.identifier),
        '{',
        repeat($.function_item),
        '}',
      ),

    function_item: ($) =>
      seq(
        repeat($.attribute),
        'fn',
        field('name', $.identifier),
        '(',
        commaSep($.parameter),
        ')',
        optional(seq('->', field('return_type', $.return_type))),
        ';',
      ),

    parameter: ($) =>
      seq(
        repeat($.attribute),
        field('name', $.identifier),
        ':',
        field('type', $.type),
      ),

    return_type: ($) => sepBy1('|', $.type),

    type_parameters: ($) => seq('<', sepBy1(',', $.identifier), '>'),

    tuple_fields: ($) => seq('(', commaSep($.type), ')'),

    field_block: ($) => seq('{', commaSep($.field), '}'),

    field: ($) =>
      seq(
        repeat($.attribute),
        field('name', $.identifier),
        ':',
        field('type', $.type),
        optional(seq('=', field('default', $._expression))),
      ),

    variant: ($) =>
      seq(
        repeat($.attribute),
        field('name', $.identifier),
        optional(choice($.tuple_fields, $.field_block)),
      ),

    // --- Types ----------------------------------------------------------

    type: ($) =>
      seq(
        field('name', $.path),
        optional($.type_arguments),
        optional(field('payload', $.tuple_fields)),
      ),

    type_arguments: ($) => seq('<', sepBy1(',', $.type), '>'),

    // --- Expressions ------------------------------------------------------

    _expression: ($) =>
      choice(
        $._literal,
        $.array_expression,
        $.call_expression,
        $.struct_expression,
        $.path,
      ),

    call_expression: ($) =>
      seq(field('function', $.path), '(', commaSep($._expression), ')'),

    struct_expression: ($) =>
      seq(field('name', $.path), '{', commaSep($.field_initializer), '}'),

    field_initializer: ($) =>
      seq(field('name', $.identifier), ':', field('value', $._expression)),

    array_expression: ($) => seq('[', commaSep($._expression), ']'),

    // --- Terminals ------------------------------------------------------

    _literal: ($) => choice($.string, $.integer, $.boolean),

    path: ($) => sepBy1('::', $.identifier),

    string: () => token(/"([^"\\\n]|\\.)*"/),

    integer: () => token(/-?[0-9]+/),

    boolean: () => choice('true', 'false'),

    identifier: () => /[A-Za-z_][A-Za-z0-9_]*/,

    doc_comment: () => token(prec(2, /\/\/[\/!][^\n]*/)),

    line_comment: () => token(prec(1, /\/\/[^\n]*/)),
  },
});
