import Vapi from "@vapi-ai/web";
import { VAPI_PUBLIC_KEY } from "./env";

let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
  if (typeof window === "undefined") {
    throw new Error("Vapi can only be initialized on the client side");
  }

  if (!vapiInstance) {
    vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
  }

  return vapiInstance;
}
