export interface BearerToken {
  user_id: number | string;
  email: string;
  role: "personal" | "team" | "organization";
}
