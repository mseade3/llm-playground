import { NextResponse } from "next/server";
import { setProactivity } from "@/lib/agent";
import { readState, updateState } from "@/lib/store";
import type { Proactivity } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    proactivity?: Proactivity;
    localComputerConnected?: boolean;
  };

  if (body.proactivity) {
    await setProactivity(body.proactivity);
  }
  if (typeof body.localComputerConnected === "boolean") {
    await updateState((s) => {
      s.localComputerConnected = body.localComputerConnected!;
    });
  }

  if (!body.proactivity && typeof body.localComputerConnected !== "boolean") {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  return NextResponse.json(await readState());
}
