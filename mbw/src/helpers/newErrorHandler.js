export function normalizeError(err) {
  console.log(err)
  const message = err.response?.data.error || err.message || "An unknown error occurred";
  return { message }
}

