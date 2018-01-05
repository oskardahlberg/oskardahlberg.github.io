'use strict'

const createObservable = () => {
  const stack = []
  const result = fn => {
    stack.push(fn)

    return () => {
      if (remains) {
        stack.splice(stack.indexOf(fn), 1)
        remains = false
      }
    }
  }

  result.invoke = (...args) => stack.forEach(fn => fn(...args))

  return result
}