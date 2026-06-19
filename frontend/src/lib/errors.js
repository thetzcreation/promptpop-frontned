// Normalizes an axios/FastAPI error into a plain string that's always safe
// to pass to toast.error() or render in JSX.
//
// FastAPI validation errors (422) return `detail` as an ARRAY of objects like
// { type, loc, msg, input, url } — not a string. Rendering that object
// directly in React throws "Objects are not valid as a React child" and
// crashes the whole tree. This was the bug found during testing in the
// admin "create/edit prompt" flow.
export function getErrorMessage(err, fallback = "Something went wrong") {
  const detail = err?.response?.data?.detail;

  if (!detail) return fallback;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        if (typeof d === "string") return d;
        const field = Array.isArray(d?.loc) ? d.loc.at(-1) : d?.loc;
        return field ? `${field}: ${d?.msg || "invalid"}` : d?.msg || "invalid value";
      })
      .join(", ");
  }

  // Last resort: detail is some other object shape.
  try {
    return JSON.stringify(detail);
  } catch {
    return fallback;
  }
}
