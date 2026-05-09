/**
 * Safely extracts a string error message from an Axios error.
 * Prevents React error #31 ("objects are not valid as React children").
 */
export function getErrMsg(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;

  // Server sent { error: "string" }
  if (typeof data?.error === 'string') return data.error;

  // Server sent { message: "string" }
  if (typeof data?.message === 'string') return data.message;

  // Network error (no response at all)
  if (!err?.response && err?.message) return `Network error: ${err.message}`;

  return fallback;
}
