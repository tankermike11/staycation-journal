import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md py-10 text-sm text-gray-600">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}