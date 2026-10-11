import { useEffect, useMemo, useState } from "react";
import {
  Instagram, Facebook, Menu, X, PawPrint, Heart, ShoppingBag,
  BookOpen, Copy, Check, Wifi, Mail, HandHeart,
} from "lucide-react";

const CONFIG = {
  GATOS_CSV: "",
  PRODUCTOS_CSV: "",
  FORM_URL: "",
  LOGO: "/logo.png",
  INSTAGRAM: "https://instagram.com/adopcionesgatunasmedellin",
  FACEBOOK: "https://facebook.com/",
  TIKTOK: "https://tiktok.com/@gatunas",
  EMAIL: "tucorreo@gmail.com",
  EBOOK_URL: "#",
  DONACIONES: [
    { medio: "Nequi", dato: "300 000 0000" },
    { medio: "Bancolombia", dato: "Ahorros 000-000000-00" },
    { medio: "BREB", dato: "@tullave" },
  ],
};

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1E1E1E]">
      <header className="sticky top-0 z-50 bg-[#1E1E1E] text-white p-4">
        <h1 className="text-xl font-black">Adopciones Gatunas <span className="text-[#00A8C6]">Medellín</span></h1>
      </header>
      <section className="bg-[#00A8C6] p-12 text-white text-center">
        <h2 className="text-4xl font-black">Un gatico está esperando tu hogar.</h2>
        <p className="mt-2 text-lg">Proceso 100% virtual en Medellín.</p>
      </section>
    </div>
  );
}
```

5. Por último, sube la mirada hacia la esquina superior derecha y haz clic en el botón verde que dice **"Confirma los cambios..."** (*Commit changes*), y vuelve a confirmar en la ventanita que te sale.
