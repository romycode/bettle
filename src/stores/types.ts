export type Header = {
  name: string
  val: string
}

export type Query = {
  name: string
  val: string
}

export type Param = {
  name: string
  val: string
}

export type RequestConfiguration = {
  id: string
  url: string
  method: string
  body: string
  query: Array<Query>
  headers: Array<Header>
  params: Array<Param>
}
