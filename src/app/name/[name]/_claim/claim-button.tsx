"use client";

import { Button } from "@/components/ui/button";
import { signMessage } from "@wagmi/core";
import { config } from "@/wagmi";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import type { ApiClaimBodyType } from "@/lib/types/api-claim-body";
import { toast } from "sonner";

/**
 * This button assumes schema validation has already been
 * performed on the name.
 */

export default function ClaimButton({
  name,
}: // address,
{
  name: string;
  // address?: Address;
}) {
  const { address } = useAccount();

  const router = useRouter();
  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      console.log("submitting...");
      if (!address) throw new Error("No address provided");

      const seed = Math.random().toString(16).substring(2, 10);
      const message = `I want to claim the subname: ${name}.wannabet.eth\n\nseed: ${seed}`;
      const signature = await signMessage(config, { message });
      const body = {
        name: name,
        address: address,
        message,
        signature,
      } satisfies ApiClaimBodyType;

      const res = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => {
      console.log("success");
      router.refresh();
      toast.success("Name claimed successfully!");
    },
    onError: (error) => {
      console.error("error");
      console.error(error);
      toast.error("Failed to claim name");
    },
  });

  if (!address) {
    return "Connect wallet to claim";
  }

  return (
    <>
      <Button onClick={() => mutate()} size="lg" disabled={isPending}>
        {isPending ? "Claiming..." : "Claim"}
      </Button>
      {error && (
        <p className="text-red-600 font-semibold pt-1">{error.message}</p>
      )}
    </>
  );
}
