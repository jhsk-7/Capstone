import { normalizeError } from "@/helpers/newErrorHandler"; // ← adjust if needed

describe("normalizeError", () => {
  const originalLog = console.log;

  beforeEach(() => {
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    jest.clearAllMocks();
  });

  test("returns message from err.response.data.error when present", () => {
    const err = { response: { data: { error: "Server exploded" } } };

    const out = normalizeError(err);

    expect(out).toEqual({ message: "Server exploded" });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(err);
  });

  test("falls back to err.message when response.data.error is missing", () => {
    const err = { message: "Network down" };

    const out = normalizeError(err);

    expect(out).toEqual({ message: "Network down" });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(err);
  });

  test('falls back to default when nothing usable is present', () => {
    const err = {};

    const out = normalizeError(err);

    expect(out).toEqual({ message: "An unknown error occurred" });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(err);
  });
});