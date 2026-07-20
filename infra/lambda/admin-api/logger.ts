// Structured JSON-lines logging to stdout — the Lambda's only log surface, so
// every level is a single parseable line in CloudWatch. No raw console.* is
// used anywhere in this function; everything routes through here.
type LogLevel = "error" | "info" | "debug";

function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    message,
    ...(context ?? {}),
  });
  process.stdout.write(`${line}\n`);
}

export const logger = {
  error: (message: string, context?: Record<string, unknown>): void =>
    write("error", message, context),
  info: (message: string, context?: Record<string, unknown>): void =>
    write("info", message, context),
  debug: (message: string, context?: Record<string, unknown>): void =>
    write("debug", message, context),
};
