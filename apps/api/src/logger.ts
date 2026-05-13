import pino from 'pino'

export function createLogger(env: { NODE_ENV?: string }) {
  return pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: { colorize: true },
          },
  })
}
