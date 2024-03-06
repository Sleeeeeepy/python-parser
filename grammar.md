# Grammar
``` bnf
program ::= [var_def | func_def | class_def]* stmt*

class_def ::= 'class' ID '('ID')' : NEWLINE INDENT class_body DEDENT

class_body ::= 'pass' NEWLINE | [var_def | func_def]+

func_def ::= 'def' ID '('[typed_var [',' typed_var]* ]?')' ['->' type]? : NEWLINE INDENT func_body DEDENT

func_body ::= [global_decl | nonlocal_decl | var_def | func_def ]* stmt+

typed_var ::= ID ':' type

type ::= ID | IDSTRING | [type]

global_decl ::= 'global' ID NEWLINE

nonlocal_decl ::= 'nonlocal' ID NEWLINE

var_def ::= typed_var '=' literal NEWLINE

stmt ::= simple_stmt NEWLINE | 'if' expr: block ['elif' expr: block]* ['else': block]? | 'while' expr: block | 'for' ID 'in' expr: block

simple_stmt ::= 'pass' | expr | 'return' [expr]? | [target '=']+ expr

block ::= NEWLINE INDENT stmt+ DEDENT

literal ::= 'NONE' | 'TRUE' | 'FALSE' | INTEGER | IDSTRING | STRING

expr ::= cexpr | 'not' expr | expr ['and' | 'or' ] expr | expr 'if' expr 'else' expr

cexpr ::= ID | literal | '['[expr [',' expr]*]?']' | '('expr')' | member_expr | index_expr | member_expr '('[expr [',' expr]*]?')' | ID '('[expr [',' expr]*]?')' | cexpr bin_op cexpr | '-' cexpr

bin_op ::= '+' | '-' | '*' | '//' | '%' | '==' | '!=' | '<=' | '>=' | '<' | '>' | 'is'

member_expr ::= cexpr '.' ID

index_expr ::= cexpr '['expr']'

target ::= ID | member_expr | index_expr
```

# Precedence and Associativity
|Precedence|Operator(s)|Associativity|
|:---:|:---:|:---:|
|1|· if · else ·|Right|
|2|or|Left|
|3|and|Left|
|4|not|N/A|
|5|==, !=, <, >, <=, >=, is| None
|6|+, - (binary)|Left
|7|*, //, %|Left
|8|- (unary)|N/A
|9| ., []|Left