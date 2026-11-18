import { Suspense } from "react";
import { KepalaTerapis, KerangkaKepalaTerapis } from "./kepala-terapis";
import { wajibTerapis } from "@/lib/auth/terapis";

/**
 * Shell ruang kerja terapis: header + halaman. Dipakai layout (terapis)/dashboard dan (terapis)/pasien
 * (bukan (terapis)/layout, karena /masuk juga ada di grup itu dan tidak boleh ber-header terapis).
 */
export function ShellTerapis({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<KerangkaKepalaTerapis />}>
        <KepalaDenganData />
      </Suspense>
      {children}
    </>
  );
}

async function KepalaDenganData() {
  const terapis = await wajibTerapis();
  return <KepalaTerapis nama={terapis.nama} email={terapis.email} />;
}
