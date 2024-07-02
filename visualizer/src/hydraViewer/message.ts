export type EvalMessage = {
  type: 'eval'
  code: string
}

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null

const isString = (value: unknown): value is string => typeof value === 'string'

export const isEvalMessage = (message: unknown): message is EvalMessage =>
  isObject(message) && (message as EvalMessage).type === 'eval' && isString((message as EvalMessage).code)
