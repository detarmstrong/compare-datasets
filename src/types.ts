export type Filter =
  | 'inner-joy-report'
  | 'just-a'
  | 'a-minus-b'
  | 'a-intersection-b'
  | 'b-minus-a'
  | 'just-b'

export interface TableDescription {
  table_name: string
  columns: string[]
}

export interface KeyDescription {
  table: string
  sheetName: string
  colName: string
}

export type KeyDescriptionArray =[KeyDescription[], KeyDescription[]]
