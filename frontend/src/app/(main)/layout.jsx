

import HeaderComponent from "@/components/Header/Header";
import FooterComponent from "@/components/Footer/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <HeaderComponent />
      <main className="min-h-[calc(100vh-57px-65px)]">{children}</main>
      <FooterComponent />
    </>
  );
}