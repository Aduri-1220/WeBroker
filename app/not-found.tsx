import Link from "next/link";
import { FileX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <FileX className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-slate-600">
          We couldn&rsquo;t find the page you&rsquo;re looking for.
        </p>
        <Button asChild variant="brand" size="lg" className="mt-6">
          <Link href="/">
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
