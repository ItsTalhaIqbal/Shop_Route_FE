const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://opeak-backend.vercel.app";

export { baseURL };
