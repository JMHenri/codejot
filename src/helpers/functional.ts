import { normalize } from "https://deno.land/std@0.194.0/path/mod.ts";

export function normalizePath(path: string) {
    // Normalize the path
    let normalizedPath = normalize(path);

    return normalizedPath;
}
