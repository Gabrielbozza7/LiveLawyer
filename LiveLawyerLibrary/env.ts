// This line will load environment variables from a .env file if it exists,
// but in the Docker environment, the variables are already provided by docker-compose.
import 'dotenv/config';

/**
 * Returns an environment variable if it exists, otherwise logs a warning and returns a default value.
 * @param variable The environment variable from process.env.
 * @param name The name of the variable (for logging).
 * @param defaultValue The value to return if the variable is not set.
 * @param hideWarning Suppress the warning message.
 * @returns The value of the variable or the default.
 */
export function defaultEnvironmentVariableWithWarning(
  variable: string | undefined,
  name: string,
  defaultValue: string = '',
  hideWarning: boolean = false,
): string {
  if (variable) {
    return variable;
  } else {
    if (!hideWarning) {
      console.warn(
        `Environment variable "${name}" is not set. Defaulting to "${defaultValue}".`,
      );
    }
    return defaultValue;
  }
}

export const BACKEND_IP_ADDRESS = defaultEnvironmentVariableWithWarning(
  process.env.BACKEND_IP_ADDRESS,
  'BACKEND_IP_ADDRESS',
  '127.0.0.1', // Defaulting to localhost is safer for a generic configuration
);
export const BACKEND_PORT = defaultEnvironmentVariableWithWarning(
  process.env.BACKEND_PORT,
  'BACKEND_PORT',
  '3001',
);
export const BACKEND_URL = `http://${BACKEND_IP_ADDRESS}:${BACKEND_PORT}`;
