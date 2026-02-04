declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        role: "USER" | "ADMIN";
      };
    }
  }
}

export {};
