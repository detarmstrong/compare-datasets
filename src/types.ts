export type Filter =
  | 'just-a'
  | 'a-minus-b'
  | 'a-intersection-b'
  | 'b-minus-a'
  | 'just-b'

export interface TableDescription {
  table_name: string
  columns: string[]
}
